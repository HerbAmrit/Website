import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(undefined);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [orderId, token]);

  async function downloadInvoice() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/invoices/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Invoice not available yet.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${order.invoice?.invoiceNumber || order.orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Couldn't download the invoice right now — please try again shortly.");
    } finally {
      setDownloading(false);
    }
  }

  if (order === undefined) {
    return <div className="section-container py-24 text-center text-bottle-800/60">Loading your order…</div>;
  }
  if (order === null) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="text-2xl font-medium">We couldn't find that order</h1>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="section-container max-w-2xl py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bottle-800 text-2xl text-cream">
        ✓
      </div>
      <h1 className="text-3xl font-medium">Order confirmed</h1>
      <p className="mt-3 text-bottle-800/70">
        Thanks — your order <span className="font-semibold text-bottle-900">{order.orderNumber}</span> is
        being prepared. A confirmation will be sent to your email once notifications are enabled.
      </p>

      <div className="mt-10 rounded-xl2 bg-beige-50 p-8 text-left shadow-card">
        <ul className="divide-y divide-beige-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>{item.product.name} × {item.quantity}</span>
              <span className="font-medium">₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-beige-200 pt-4 text-base font-semibold">
          <span>Total paid</span>
          <span>₹{Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {order.invoice && (
          <button onClick={downloadInvoice} disabled={downloading} className="btn-outline">
            {downloading ? "Preparing…" : "Download GST invoice"}
          </button>
        )}
        <Link to="/shop" className="btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
