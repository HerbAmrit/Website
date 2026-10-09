import { prisma } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function listOrders(req, res) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } }, invoice: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
}

export async function getOrder(req, res, next) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, invoice: true, coupon: true },
  });
  if (!order || (order.userId !== req.user.id && req.user.role !== "ADMIN")) {
    return next(new ApiError(404, "Order not found."));
  }
  res.json(order);
}
