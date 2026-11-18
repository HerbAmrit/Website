import { prisma } from "../config/db.js";

export async function getBalance(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { loyaltyPoints: true } });
  res.json({ balance: user.loyaltyPoints });
}

export async function getHistory(req, res) {
  const entries = await prisma.loyaltyLedgerEntry.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(entries);
}
