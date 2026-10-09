// Produces order numbers like HA-2026-000123 — sequential per year, easy for
// customers and support staff to reference (vs. a raw UUID).
import { prisma } from "../config/db.js";

export async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `HA-${year}-`;

  const latest = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
  });

  const nextSeq = latest ? Number(latest.orderNumber.split("-")[2]) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(6, "0")}`;
}
