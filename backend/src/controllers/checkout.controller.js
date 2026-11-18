import { prisma } from "../config/db.js";
import { config } from "../config/env.js";
import { ApiError } from "../middleware/errorHandler.js";
import { priceCart, applyCoupon, computeTotals } from "../services/pricing.service.js";
import { createRazorpayOrder, verifyPaymentSignature } from "../services/razorpay.service.js";
import { generateOrderNumber } from "../utils/orderNumber.js";
import { generateInvoicePdf, generateInvoiceNumber } from "../services/invoice.service.js";
import { computeEarnedPoints, computeRedemptionValue } from "../services/loyalty.service.js";
import { notifyOrderEvent, notifyOwnerNewOrder } from "../services/notifications.service.js";

const addressSchema = ["line1", "city", "state", "pincode", "phone"];

// POST /api/checkout/create-order
// Body: { items: [{ productId, quantity }], couponCode?, shippingAddress }
export async function createOrder(req, res, next) {
  if (!config.razorpay.isConfigured) {
    return next(new ApiError(503, "Online payment isn't configured yet — add your Razorpay keys to enable checkout."));
  }

  const { items, couponCode, shippingAddress, redeemPoints: rawRedeemPoints } = req.body;
  for (const field of addressSchema) {
    if (!shippingAddress?.[field]) {
      return next(new ApiError(400, `Shipping address is missing "${field}".`));
    }
  }

  try {
    const { lineItems, subtotal } = await priceCart(items);
    const { coupon, discountAmount, freeShipping } = await applyCoupon(couponCode, subtotal, req.user.id);

    // Loyalty points redemption — validated against the user's actual balance so a
    // stale or tampered client value can't redeem more than they have.
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const redeemPoints = Math.max(0, Math.floor(Number(rawRedeemPoints) || 0));
    if (redeemPoints > user.loyaltyPoints) {
      return next(new ApiError(400, `You only have ${user.loyaltyPoints} loyalty points available.`));
    }
    const loyaltyPointsValue = redeemPoints > 0 ? await computeRedemptionValue(redeemPoints) : 0;

    const { shippingCharge, gstAmount, total } = computeTotals({ subtotal, discountAmount, freeShipping, loyaltyPointsValue });
    if (total <= 0) {
      return next(new ApiError(400, "Discounts and points bring this order to ₹0 — reduce the coupon or points used so there's a payable amount."));
    }

    const orderNumber = await generateOrderNumber();

    const dbOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user.id,
        subtotal,
        shippingCharge,
        gstAmount,
        discountAmount,
        loyaltyPointsUsed: redeemPoints,
        total,
        couponId: coupon?.id,
        shippingAddress,
        status: "PENDING",
        paymentStatus: "UNPAID",
        items: {
          create: lineItems.map((li) => ({
            productId: li.productId,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
          })),
        },
      },
    });

    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: total,
      receipt: orderNumber,
    });

    await prisma.order.update({
      where: { id: dbOrder.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    res.status(201).json({
      orderId: dbOrder.id,
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise, for the Razorpay widget
      currency: razorpayOrder.currency,
      razorpayKeyId: config.razorpay.keyId,
      total,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/checkout/verify-payment
// Body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
export async function verifyPayment(req, res, next) {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true, coupon: true },
  });
  if (!order || order.userId !== req.user.id) {
    return next(new ApiError(404, "Order not found."));
  }
  if (order.razorpayOrderId !== razorpayOrderId) {
    return next(new ApiError(400, "This payment doesn't match the order."));
  }

  const isValid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!isValid) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
    return next(new ApiError(400, "Payment verification failed. If you were charged, contact support with your order number."));
  }

  try {
    const earnedPoints = await computeEarnedPoints(Number(order.subtotal));

    await prisma.$transaction(async (tx) => {
      // Re-check and decrement stock atomically now that payment is confirmed.
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new ApiError(409, `"${item.product.name}" no longer has enough stock. Contact support — you have been charged.`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (order.couponId) {
        await tx.coupon.update({ where: { id: order.couponId }, data: { timesUsed: { increment: 1 } } });
      }

      if (order.loyaltyPointsUsed > 0) {
        await tx.user.update({ where: { id: order.userId }, data: { loyaltyPoints: { decrement: order.loyaltyPointsUsed } } });
        await tx.loyaltyLedgerEntry.create({
          data: { userId: order.userId, points: -order.loyaltyPointsUsed, reason: `Redeemed on order ${order.orderNumber}` },
        });
      }
      if (earnedPoints > 0) {
        await tx.user.update({ where: { id: order.userId }, data: { loyaltyPoints: { increment: earnedPoints } } });
        await tx.loyaltyLedgerEntry.create({
          data: { userId: order.userId, points: earnedPoints, reason: `Earned from order ${order.orderNumber}` },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: "PROCESSING", paymentStatus: "PAID", razorpayPaymentId },
      });
    });

    const invoiceNumber = await generateInvoiceNumber(prisma);
    await generateInvoicePdf({ order, invoiceNumber });
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        gstNumber: config.gst.number || "NOT_CONFIGURED",
      },
    });

    notifyOrderEvent("ORDER_CONFIRMED", order).catch(() => {}); // never blocks the response
    notifyOwnerNewOrder(order).catch(() => {});

    res.json({ orderId: order.id, orderNumber: order.orderNumber, invoiceNumber, status: "PAID", pointsEarned: earnedPoints });
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(500, "Payment succeeded but order finalization failed. Contact support with your order number."));
  }
}
