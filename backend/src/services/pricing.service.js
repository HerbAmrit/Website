import { prisma } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";

export const SHIPPING_FLAT_RATE = 60;
export const GST_RATE = 0.05; // placeholder flat rate — replace with your actual HSN-based slab(s)

// Recomputes prices from the database using only { productId, quantity } pairs from the
// client — never trusts client-submitted prices. Throws if stock is insufficient.
export async function priceCart(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new ApiError(400, "Your cart is empty.");
  }
  if (cartItems.some((i) => !i.productId || typeof i.productId !== "string")) {
    throw new ApiError(400, "One of the items in your cart is outdated. Please remove it and add it again.");
  }

  const productIds = cartItems.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  const lineItems = cartItems.map((ci) => {
    const product = products.find((p) => p.id === ci.productId);
    if (!product || !product.isActive) {
      throw new ApiError(400, `One of the items in your cart is no longer available.`);
    }
    if (product.stock < ci.quantity) {
      throw new ApiError(409, `Only ${product.stock} left of "${product.name}" — please update your cart.`);
    }
    return {
      productId: product.id,
      name: product.name,
      quantity: ci.quantity,
      unitPrice: Number(product.price),
    };
  });

  const subtotal = lineItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  return { lineItems, subtotal };
}

// Validates a coupon against the cart + user, returns the discount and shipping override.
// Throws ApiError with a customer-facing message on any failure.
export async function applyCoupon(code, subtotal, userId) {
  if (!code) return { coupon: null, discountAmount: 0, freeShipping: false };

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) throw new ApiError(400, "That coupon code isn't valid.");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, "That coupon has expired.");
  if (coupon.maxUses && coupon.timesUsed >= coupon.maxUses) {
    throw new ApiError(400, "That coupon has reached its usage limit.");
  }
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    throw new ApiError(400, `This coupon needs a minimum order of ₹${coupon.minOrderValue}.`);
  }
  if (coupon.oneTimePerUser && userId) {
    const priorUse = await prisma.order.findFirst({ where: { couponId: coupon.id, userId } });
    if (priorUse) throw new ApiError(400, "You've already used this coupon.");
  }

  const discountAmount =
    coupon.type === "PERCENTAGE"
      ? Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100
      : Math.min(Number(coupon.value), subtotal);

  return { coupon, discountAmount, freeShipping: coupon.freeShipping };
}

export function computeTotals({ subtotal, discountAmount = 0, freeShipping = false, loyaltyPointsValue = 0 }) {
  const shippingCharge = freeShipping ? 0 : SHIPPING_FLAT_RATE;
  const taxableAmount = Math.max(subtotal - discountAmount, 0);
  const gstAmount = Math.round(taxableAmount * GST_RATE * 100) / 100;
  const total = Math.max(taxableAmount + shippingCharge + gstAmount - loyaltyPointsValue, 0);
  return { shippingCharge, gstAmount, total: Math.round(total * 100) / 100 };
}
