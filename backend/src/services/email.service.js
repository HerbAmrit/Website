import nodemailer from "nodemailer";
import { config } from "../config/env.js";

let transporter = null;
function getTransporter() {
  if (!config.smtp.isConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email not configured] Would send "${subject}" to ${to}`);
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" };
  }
  try {
    await t.sendMail({ from: config.smtp.from, to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error("Email send failed:", err.message);
    return { sent: false, reason: "SEND_FAILED" };
  }
}
