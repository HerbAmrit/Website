import { priceCart, applyCoupon, computeTotals } from "../services/pricing.service.js";
import { ApiError } from "../middleware/errorHandler.js";

// POST /api/coupons/validate — previews a coupon's effect on the current cart without
// creating an order, so the checkout page can show the discount before payment.
export async function validateCoupon(req, res, next) {
  const { code, items } = req.body;
  if (!code) return next(new ApiError(400, "Enter a coupon code."));

  try {
    const { subtotal } = await priceCart(items);
    const { coupon, discountAmount, freeShipping } = await applyCoupon(code, subtotal, req.user?.id);
    const totals = computeTotals({ subtotal, discountAmount, freeShipping });

    res.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      freeShipping,
      ...totals,
      subtotal,
    });
  } catch (err) {
    next(err);
  }
}
