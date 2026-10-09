import { sendEmail } from "../../services/email.service.js";
import { sendWhatsApp } from "../../services/whatsapp.service.js";
import { ApiError } from "../../middleware/errorHandler.js";

// POST /api/admin/notifications/test  Body: { email?, phone? }
export async function sendTestNotification(req, res, next) {
  const { email, phone } = req.body;
  if (!email && !phone) return next(new ApiError(400, "Provide an email and/or phone number to test."));

  const results = {};
  if (email) {
    results.email = await sendEmail({
      to: email,
      subject: "Test notification from your HerbAmrit admin dashboard",
      html: "<p>This is a test email. If you received this, your SMTP settings are working.</p>",
    });
  }
  if (phone) {
    results.whatsapp = await sendWhatsApp({ to: phone, body: "HerbAmrit: this is a test WhatsApp message from your admin dashboard." });
  }
  res.json(results);
}
