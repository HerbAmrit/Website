import { prisma } from "../../config/db.js";
import { ApiError } from "../../middleware/errorHandler.js";

export async function listMessages(req, res) {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  res.json(messages);
}

export async function markMessageRead(req, res, next) {
  try {
    const message = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json(message);
  } catch (err) {
    if (err.code === "P2025") return next(new ApiError(404, "Message not found."));
    next(err);
  }
}
