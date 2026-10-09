import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

export async function listCoupons(req, res) {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  res.json(coupons);
}

export async function createCoupon(req, res, next) {
  const { code, type, value, minOrderValue, maxUses, oneTimePerUser, freeShipping, expiresAt } = req.body;
  if (!code || !type || value == null) {
    return next(new ApiError(400, "Coupon needs at least a code, type, and value."));
  }
  if (!["PERCENTAGE", "FIXED"].includes(type)) {
    return next(new ApiError(400, "Type must be PERCENTAGE or FIXED."));
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value,
        minOrderValue: minOrderValue || null,
        maxUses: maxUses || null,
        oneTimePerUser: Boolean(oneTimePerUser),
        freeShipping: Boolean(freeShipping),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === "P2002") return next(new ApiError(409, "A coupon with that code already exists."));
    next(err);
  }
}

export async function updateCoupon(req, res, next) {
  const { code, type, value, minOrderValue, maxUses, oneTimePerUser, freeShipping, expiresAt, isActive } = req.body;
  try {
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        ...(code && { code: code.trim().toUpperCase() }),
        ...(type && { type }),
        ...(value != null && { value }),
        ...(minOrderValue !== undefined && { minOrderValue: minOrderValue || null }),
        ...(maxUses !== undefined && { maxUses: maxUses || null }),
        ...(oneTimePerUser !== undefined && { oneTimePerUser: Boolean(oneTimePerUser) }),
        ...(freeShipping !== undefined && { freeShipping: Boolean(freeShipping) }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });
    res.json(coupon);
  } catch (err) {
    if (err.code === "P2025") return next(new ApiError(404, "Coupon not found."));
    next(err);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") return next(new ApiError(404, "Coupon not found."));
    // Coupons already used on real orders can't be hard-deleted (FK constraint) —
    // deactivate instead so history stays intact.
    if (err.code === "P2003") {
      await prisma.coupon.update({ where: { id: req.params.id }, data: { isActive: false } });
      return res.json({ deactivated: true });
    }
    next(err);
  }
}
