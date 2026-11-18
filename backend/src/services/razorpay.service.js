import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/env.js";

let client = null;
function getClient() {
  if (!config.razorpay.isConfigured) return null;
  if (!client) {
    client = new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });
  }
  return client;
}

// Amount must be in paise (smallest currency unit) per Razorpay's API.
export async function createRazorpayOrder({ amountInRupees, receipt }) {
  const rzp = getClient();
  if (!rzp) throw new Error("RAZORPAY_NOT_CONFIGURED");

  return rzp.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
  });
}

// Verifies the HMAC signature Razorpay sends back after a successful checkout,
// per their documented client-side verification flow. Never trust an unverified
// "success" callback — this is the step that actually confirms payment.
export function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const expected = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return expected === razorpaySignature;
}

// Verifies webhook payloads (for server-to-server events like refunds/failures),
// separate secret from the checkout signature above.
export function verifyWebhookSignature(rawBody, signatureHeader) {
  const expected = crypto
    .createHmac("sha256", config.razorpay.webhookSecret)
    .update(rawBody)
    .digest("hex");
  return expected === signatureHeader;
}
