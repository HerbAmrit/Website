import { sendWhatsApp } from "../../services/whatsapp.service.js";
import { ApiError } from "../../middleware/errorHandler.js";

// POST /api/admin/notifications/test  Body: { phone }
export async function sendTestNotification(req, res, next) {
  const { phone } = req.body;
  if (!phone) return next(new ApiError(400, "Enter a WhatsApp number to test."));

  const whatsapp = await sendWhatsApp({ to: phone, body: "HerbAmrit: this is a test WhatsApp message from your admin dashboard." });
  res.json({ whatsapp });
}
