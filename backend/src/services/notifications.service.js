import { sendWhatsApp } from "./whatsapp.service.js";
import { getSetting } from "./settings.service.js";

const MESSAGES = {
  ORDER_CONFIRMED: (order) => `HerbAmrit: Order ${order.orderNumber} confirmed. Total Rs.${Number(order.total).toFixed(2)}. Thank you!`,
  ORDER_SHIPPED: (order) => `HerbAmrit: Order ${order.orderNumber} has shipped.`,
  ORDER_DELIVERED: (order) => `HerbAmrit: Order ${order.orderNumber} delivered. Enjoy!`,
  ORDER_CANCELLED: (order) => `HerbAmrit: Order ${order.orderNumber} cancelled.`,
};

// Customer order updates go out by WhatsApp only, to the phone number given at checkout
// (mandatory), falling back to the account profile phone. Failures are logged inside
// sendWhatsApp and never throw, so a messaging problem can't break checkout or an admin's
// order-status update.
export async function notifyOrderEvent(eventKey, order) {
  const buildMessage = MESSAGES[eventKey];
  if (!buildMessage || !order.user) return;
  const phone = order.shippingAddress?.phone || order.user.phone;
  return sendWhatsApp({ to: phone, body: buildMessage(order) });
}

// Sends a WhatsApp message to the business owner's number (editable in /admin/settings).
// Best-effort: callers must not depend on delivery — the source of truth is the database.
export async function notifyOwner(text) {
  const number = (await getSetting("notify_whatsapp_number")) || (await getSetting("whatsapp_number"));
  return sendWhatsApp({ to: number, body: text });
}

export async function notifyOwnerNewOrder(order) {
  const items = order.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ");
  const phone = order.shippingAddress?.phone || order.user?.phone || "n/a";
  return notifyOwner(
    `New order ${order.orderNumber}\nTotal: Rs.${Number(order.total).toFixed(2)}\nCustomer: ${order.user.name} (${phone})\nItems: ${items}`
  );
}
