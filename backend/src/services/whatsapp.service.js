import twilio from "twilio";
import { config } from "../config/env.js";

let client = null;
function getClient() {
  if (!config.whatsapp.isConfigured) return null;
  if (!client) client = twilio(config.whatsapp.accountSid, config.whatsapp.authToken);
  return client;
}

// Normalizes a customer-entered phone number (e.g. "8392010617") into E.164 format
// (e.g. "+918392010617"), which Twilio's WhatsApp API requires. Assumes the
// business's default country code for any number that isn't already in
// international format — reasonable for a single-country business today, but
// worth revisiting if HerbAmrit ever ships internationally.
function toE164(rawNumber) {
  const cleaned = String(rawNumber).replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  const digits = cleaned.replace(/\D/g, "").replace(/^0+/, "");
  // 10 digits = local number without country code; longer = already includes the country code
  if (digits.length <= 10) return `${config.whatsapp.defaultCountryCode}${digits}`;
  return `+${digits}`;
}

export async function sendWhatsApp({ to, body }) {
  if (!to) return { sent: false, reason: "NO_PHONE_ON_FILE" };

  const c = getClient();
  if (!c) {
    console.log(`[whatsapp not configured] Would send to ${to}: ${body}`);
    return { sent: false, reason: "WHATSAPP_NOT_CONFIGURED" };
  }
  try {
    await c.messages.create({
      from: `whatsapp:${config.whatsapp.fromNumber}`,
      to: `whatsapp:${toE164(to)}`,
      body,
    });
    return { sent: true };
  } catch (err) {
    console.error("WhatsApp send failed:", err.message);
    return { sent: false, reason: "SEND_FAILED" };
  }
}
