import { z } from "zod";
import { prisma } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";
import { notifyOwner } from "../services/notifications.service.js";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(2000),
});

// POST /api/contact — saves the message (never lost), then pings the owner on WhatsApp.
export async function submitContact(req, res, next) {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, "Please enter your name, a valid email, and a message."));
  }
  const { name, email, message } = parsed.data;

  await prisma.contactMessage.create({ data: { name, email, message } });

  notifyOwner(`New website message\nFrom: ${name} (${email})\n\n${message.slice(0, 1000)}`).catch(() => {});

  res.status(201).json({ received: true });
}
