import { sendEmail } from "./email.service.js";
import { sendWhatsApp } from "./whatsapp.service.js";
import { getSetting } from "./settings.service.js";

const TEMPLATES = {
  ORDER_CONFIRMED: (order) => ({
    subject: `Order ${order.orderNumber} confirmed`,
    html: `<p>Hi ${order.user.name},</p><p>Your order <strong>${order.orderNumber}</strong> is confirmed — payment received. Total: Rs. ${Number(order.total).toFixed(2)}.</p>`,
    whatsapp: `HerbAmrit: Order ${order.orderNumber} confirmed. Total Rs.${Number(order.total).toFixed(2)}. Thank you!`,
  }),
  ORDER_SHIPPED: (order) => ({
    subject: `Order ${order.orderNumber} has shipped`,
    html: `<p>Hi ${order.user.name},</p><p>Your order <strong>${order.orderNumber}</strong> is on its way.</p>`,
    whatsapp: `HerbAmrit: Order ${order.orderNumber} has shipped.`,
  }),
  ORDER_DELIVERED: (order) => ({
    subject: `Order ${order.orderNumber} delivered`,
    html: `<p>Hi ${order.user.name},</p><p>Your order <strong>${order.orderNumber}</strong> was delivered. Enjoy your tea!</p>`,
    whatsapp: `HerbAmrit: Order ${order.orderNumber} delivered. Enjoy!`,
  }),
  ORDER_CANCELLED: (order) => ({
    subject: `Order ${order.orderNumber} cancelled`,
    html: `<p>Hi ${order.user.name},</p><p>Your order <strong>${order.orderNumber}</strong> has been cancelled.</p>`,
    whatsapp: `HerbAmrit: Order ${order.orderNumber} cancelled.`,
  }),
};

// Fire-and-forget from the caller's perspective — failures are logged inside
// sendEmail/sendWhatsApp and never throw, so a notification issue can't break
// checkout or an admin's order-status update.
//
// WhatsApp goes to the phone number from the order's shipping address (mandatory
// at checkout), not the optional account-profile phone — that way every order
// has a deliverable number on file, even for a customer who never filled in their
// profile phone.
export async function notifyOrderEvent(eventKey, order) {
  const template = TEMPLATES[eventKey];
  if (!template || !order.user) return;
  const { subject, html, whatsapp } = template(order);
  const phone = order.shippingAddress?.phone || order.user.phone;

  return Promise.allSettled([
    sendEmail({ to: order.user.email, subject, html }),
    sendWhatsApp({ to: phone, body: whatsapp }),
  ]);
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
