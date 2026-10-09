import { prisma } from "../../config/db.js";

// GET /api/admin/analytics/overview?days=30
// One call gives the dashboard everything it needs: revenue in the window, order
// counts by status (all-time, so pending orders needing action are always visible
// regardless of the selected window), best sellers, and a daily revenue series.
// The frontend re-requests this with days=7/30/90/365 to cover the spec's
// daily/weekly/monthly/yearly reporting views without needing four separate endpoints.
export async function getOverview(req, res) {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [ordersInWindow, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      include: { items: { include: { product: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const paidOrders = ordersInWindow.filter((o) => o.paymentStatus === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const productTotals = new Map();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const entry = productTotals.get(item.productId) || {
        productId: item.productId,
        name: item.product.name,
        quantitySold: 0,
        revenue: 0,
      };
      entry.quantitySold += item.quantity;
      entry.revenue += Number(item.unitPrice) * item.quantity;
      productTotals.set(item.productId, entry);
    }
  }
  const bestSellers = [...productTotals.values()].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);

  const dailyMap = new Map();
  for (const order of paidOrders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(day) || { date: day, revenue: 0, orders: 0 };
    entry.revenue += Number(order.total);
    entry.orders += 1;
    dailyMap.set(day, entry);
  }
  const dailyRevenue = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  const statusCountsObj = Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all]));

  res.json({
    days,
    totalRevenue,
    orderCount: ordersInWindow.length,
    paidOrderCount: paidOrders.length,
    statusCounts: {
      PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0,
      ...statusCountsObj,
    },
    bestSellers,
    dailyRevenue,
  });
}
