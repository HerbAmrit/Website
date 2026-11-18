import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { brand } from "../data/brand.js";
import { loadRazorpayScript } from "../utils/loadRazorpay.js";
import ProductImage from "../components/ProductImage.jsx";

const SHIPPING_FLAT_RATE = 60; // display-only estimate; backend recomputes authoritatively
const GST_RATE = 0.05;

const EMPTY_ADDRESS = { line1: "", line2: "", city: "", state: "", pincode: "", phone: "" };

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated, token, user, openAuthModal } = useAuth();
  const settings = useSettings();
  const navigate = useNavigate();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);
  const [applying, setApplying] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetch("/api/loyalty/balance", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { balance: 0 }))
      .then((data) => setPointsBalance(data.balance))
      .catch(() => {});
  }, [token]);

  // Server-authoritative totals once a coupon has been validated; falls back to a
  // client-side estimate before that (final numbers are always recomputed server-side
  // again at order creation, so this is just for display).
  const [serverTotals, setServerTotals] = useState(null);

  const shipping = serverTotals?.shippingCharge ?? (items.length ? SHIPPING_FLAT_RATE : 0);
  const gst = serverTotals?.gstAmount ?? subtotal * GST_RATE;
  const discount = serverTotals?.discountAmount ?? 0;
  const redemptionRate = Number(settings.loyalty_redemption_value) || 1;
  const loyaltyDiscount = redeemPoints * redemptionRate;
  const preLoyaltyTotal = serverTotals?.total ?? subtotal + shipping + gst - discount;
  const total = Math.max(preLoyaltyTotal - loyaltyDiscount, 0);

  function updateRedeemPoints(value) {
    const n = Math.max(0, Math.min(Number(value) || 0, pointsBalance));
    setRedeemPoints(n);
  }

  function updateAddress(key, value) {
    setAddress((a) => ({ ...a, [key]: value }));
  }

  async function applyCoupon(e) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponMessage(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code: couponCode,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponMessage({ type: "error", text: data.message || "That code isn't valid." });
        setServerTotals(null);
        return;
      }
      setServerTotals(data);
      setCouponMessage({ type: "success", text: `Coupon "${data.code}" applied.` });
    } catch {
      setCouponMessage({ type: "error", text: "Couldn't reach the server. Is the backend running?" });
    } finally {
      setApplying(false);
    }
  }

  async function handlePayment() {
    setPayError(null);
    const missing = ["line1", "city", "state", "pincode", "phone"].find((f) => !address[f].trim());
    if (missing) {
      setPayError("Please fill in your full shipping address.");
      return;
    }

    setPaying(true);
    try {
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          couponCode: couponCode || undefined,
          shippingAddress: address,
          redeemPoints,
        }),
      });
      const order = await createRes.json();

      if (!createRes.ok) {
        if (createRes.status === 503) {
          setPayError("Online payments aren't set up yet — the site owner needs to add Razorpay credentials before checkout can go live.");
        } else {
          setPayError(order.message || "Couldn't start checkout. Please try again.");
        }
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPayError("Couldn't load the payment widget. Check your connection and try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: brand.name,
        description: `Order ${order.orderNumber}`,
        prefill: { name: user?.name, email: user?.email, contact: address.phone },
        theme: { color: "#B98D2E" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                orderId: order.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            if (!verifyRes.ok) {
              const data = await verifyRes.json();
              setPayError(data.message || "Payment verification failed.");
              return;
            }
            clearCart();
            navigate(`/order-confirmation/${order.orderId}`);
          } catch {
            setPayError("Payment succeeded but confirming it failed. Contact support with order " + order.orderNumber);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      razorpay.open();
    } catch {
      setPayError("Something went wrong starting checkout. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="text-2xl font-medium">Nothing to check out yet</h1>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse teas</Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="text-2xl font-medium">Log in to check out</h1>
        <p className="mt-3 text-bottle-800/60">We need an account to attach your order and invoice to.</p>
        <button onClick={openAuthModal} className="btn-primary mt-6">Log in or create an account</button>
      </div>
    );
  }

  return (
    <div className="section-container py-16">
      <h1 className="mb-10 text-3xl font-medium">Checkout</h1>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl2 bg-beige-50 p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg text-bottle-900">Order items</h2>
            <ul className="divide-y divide-beige-200">
              {items.map((item) => (
                <li key={item.slug} className="flex items-center gap-4 py-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-beige-200 text-2xl">
                    <ProductImage src={item.image} alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-bottle-900">{item.name}</p>
                    <p className="text-xs text-bottle-800/60">Qty {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="text-sm font-semibold text-bottle-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl2 bg-beige-50 p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg text-bottle-900">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <AddressField label="Address line 1" value={address.line1} onChange={(v) => updateAddress("line1", v)} required full />
              <AddressField label="Address line 2 (optional)" value={address.line2} onChange={(v) => updateAddress("line2", v)} full />
              <AddressField label="City" value={address.city} onChange={(v) => updateAddress("city", v)} required />
              <AddressField label="State" value={address.state} onChange={(v) => updateAddress("state", v)} required />
              <AddressField label="Pincode" value={address.pincode} onChange={(v) => updateAddress("pincode", v)} required />
              <AddressField label="Phone / WhatsApp number" value={address.phone} onChange={(v) => updateAddress("phone", v)} required />
            </div>
          </section>

          <section className="rounded-xl2 bg-beige-50 p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg text-bottle-900">Have a coupon?</h2>
            <form onSubmit={applyCoupon} className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 rounded-full border border-beige-300 bg-cream px-5 py-2.5 text-sm outline-none focus:border-gold-500"
                aria-label="Coupon code"
              />
              <button type="submit" disabled={applying} className="btn-outline shrink-0">
                {applying ? "Applying…" : "Apply"}
              </button>
            </form>
            {couponMessage && (
              <p className={`mt-3 text-sm ${couponMessage.type === "error" ? "text-red-700" : "text-bottle-800/70"}`}>
                {couponMessage.text}
              </p>
            )}
          </section>

          {pointsBalance > 0 && (
            <section className="rounded-xl2 bg-beige-50 p-6 shadow-card">
              <h2 className="mb-1 font-display text-lg text-bottle-900">Redeem loyalty points</h2>
              <p className="mb-4 text-sm text-bottle-800/60">
                You have {pointsBalance} points, worth up to ₹{(pointsBalance * redemptionRate).toFixed(2)}.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={pointsBalance}
                  value={redeemPoints}
                  onChange={(e) => updateRedeemPoints(e.target.value)}
                  className="w-28 rounded-lg border border-beige-300 bg-cream px-4 py-2.5 text-sm outline-none focus:border-gold-500"
                />
                <button type="button" onClick={() => updateRedeemPoints(pointsBalance)} className="text-sm font-medium text-gold-600 underline">
                  Use all
                </button>
                {redeemPoints > 0 && (
                  <button type="button" onClick={() => updateRedeemPoints(0)} className="text-sm text-bottle-800/50 underline">
                    Clear
                  </button>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="h-fit rounded-xl2 bg-bottle-900 p-8 text-beige-100">
          <h2 className="font-display text-xl text-cream">Payable amount</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <Row label="Subtotal" value={serverTotals?.subtotal ?? subtotal} />
            <Row label="Shipping" value={shipping} />
            <Row label="GST (5%)" value={gst} />
            {discount > 0 && <Row label="Discount" value={-discount} />}
            {loyaltyDiscount > 0 && <Row label={`Points redeemed (${redeemPoints})`} value={-loyaltyDiscount} />}
          </dl>
          <div className="mt-4 flex justify-between border-t border-beige-100/20 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          {payError && <p className="mt-4 text-sm text-red-300">{payError}</p>}

          <button onClick={handlePayment} disabled={paying} className="btn-gold mt-6 w-full">
            {paying ? "Opening payment…" : "Pay with Razorpay"}
          </button>
          <p className="mt-3 text-center text-xs text-beige-100/50">
            UPI, Visa &amp; Mastercard via Razorpay.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-beige-100/80">
      <span>{label}</span>
      <span>₹{value.toFixed(2)}</span>
    </div>
  );
}

function AddressField({ label, value, onChange, required, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-sm font-medium text-bottle-900">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-beige-300 bg-cream px-4 py-2.5 text-sm outline-none focus:border-gold-500"
      />
    </div>
  );
}
