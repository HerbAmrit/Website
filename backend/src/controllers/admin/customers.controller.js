import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

// GET /api/admin/customers?search=
export async function listCustomers(req, res) {
  const { search } = req.query;
  const where = {
    role: "CUSTOMER",
    ...(search && {
      OR: [
        { name: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
      ],
    }),
  };

  const users = await prisma.user.findMany({
    where,
    include: { _count: { select: { orders: true } }, orders: { select: { total: true, paymentStatus: true } } },
    orderBy: { createdAt: "desc" },
  });

  const customers = users.map((u) => {
    const totalSpent = u.orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + Number(o.total), 0);
    const { orders, _count, ...rest } = u;
    return { ...rest, orderCount: _count.orders, totalSpent };
  });

  res.json(customers);
}

export async function getCustomer(req, res, next) {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { orders: { include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" } }, addresses: true },
  });
  if (!user || user.role !== "CUSTOMER") return next(new ApiError(404, "Customer not found."));
  const { passwordHash, ...rest } = user;
  res.json(rest);
}
