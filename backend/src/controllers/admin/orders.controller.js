import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";
import { notifyOrderEvent } from "../../services/notifications.service.js";

const VALID_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_TO_EVENT = {
  SHIPPED: "ORDER_SHIPPED",
  DELIVERED: "ORDER_DELIVERED",
  CANCELLED: "ORDER_CANCELLED",
};

// GET /api/admin/orders?status=&search=&page=&limit=
export async function listAllOrders(req, res) {
  const { status, search, page = 1, limit = 20 } = req.query;

  const where = {
    ...(status && { status: String(status) }),
    ...(search && {
      OR: [
        { orderNumber: { contains: String(search), mode: "insensitive" } },
        { user: { email: { contains: String(search), mode: "insensitive" } } },
        { user: { name: { contains: String(search), mode: "insensitive" } } },
      ],
    }),
  };

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ items, total, page: Number(page), pageSize: take });
}

export async function getOrderAdmin(req, res, next) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { user: true, items: { include: { product: true } }, invoice: true, coupon: true },
  });
  if (!order) return next(new ApiError(404, "Order not found."));
  res.json(order);
}

// PATCH /api/admin/orders/:id/status  Body: { status }
export async function updateOrderStatus(req, res, next) {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return next(new ApiError(400, `Status must be one of: ${VALID_STATUSES.join(", ")}`));
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true, user: true } });
  if (!order) return next(new ApiError(404, "Order not found."));

  // Restock automatically if an order that had already had stock deducted (i.e. was
  // paid) gets cancelled — keeps inventory accurate without a separate manual step.
  const isNewlyCancelled = status === "CANCELLED" && order.status !== "CANCELLED" && order.paymentStatus === "PAID";

  await prisma.$transaction(async (tx) => {
    if (isNewlyCancelled) {
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }
    await tx.order.update({ where: { id: order.id }, data: { status } });
  });

  const eventKey = STATUS_TO_EVENT[status];
  if (eventKey) {
    notifyOrderEvent(eventKey, order).catch(() => {}); // never blocks the response
  }

  res.json({ id: order.id, status });
}
