import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { config } from "../config/env.js";

const INVOICE_DIR = path.resolve("uploads/invoices");

// Renders a simple, compliant-shaped tax invoice: business + GSTIN, customer + shipping
// address, itemized lines, and the tax/discount/shipping breakdown. Saved to disk and
// streamed back on request rather than regenerated every time.
export async function generateInvoicePdf({ order, invoiceNumber, issuedAt = new Date() }) {
  fs.mkdirSync(INVOICE_DIR, { recursive: true });
  const filePath = path.join(INVOICE_DIR, `${invoiceNumber}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text(config.gst.businessName || "Your Business Name");
    doc.fontSize(9).fillColor("#555").text(config.gst.address || "Business address not configured");
    if (config.gst.number) doc.text(`GSTIN: ${config.gst.number}`);
    doc.fillColor("#000");
    doc.moveDown(1.5);

    doc.fontSize(15).text("Tax Invoice", { align: "right" });
    doc.fontSize(9).fillColor("#555");
    doc.text(`Invoice #: ${invoiceNumber}`, { align: "right" });
    doc.text(`Order #: ${order.orderNumber}`, { align: "right" });
    doc.text(`Date: ${new Date(issuedAt).toLocaleDateString("en-IN")}`, { align: "right" });
    doc.fillColor("#000");
    doc.moveDown(1.5);

    doc.fontSize(11).text("Bill To");
    doc.fontSize(9).fillColor("#555");
    doc.text(order.user.name);
    doc.text(order.user.email);
    const addr = order.shippingAddress;
    if (addr) {
      doc.text(`${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}`);
      doc.text(`${addr.city}, ${addr.state} ${addr.pincode}`);
    }
    doc.fillColor("#000");
    doc.moveDown(1.5);

    const tableTop = doc.y;
    doc.fontSize(9).fillColor("#555");
    doc.text("Item", 50, tableTop);
    doc.text("Qty", 320, tableTop);
    doc.text("Unit Price", 380, tableTop);
    doc.text("Amount", 470, tableTop);
    doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).strokeColor("#ccc").stroke();
    doc.fillColor("#000");

    let y = tableTop + 22;
    for (const item of order.items) {
      doc.fontSize(9).text(item.product.name, 50, y, { width: 260 });
      doc.text(String(item.quantity), 320, y);
      doc.text(`Rs. ${Number(item.unitPrice).toFixed(2)}`, 380, y);
      doc.text(`Rs. ${(Number(item.unitPrice) * item.quantity).toFixed(2)}`, 470, y);
      y += 20;
    }

    doc.moveTo(50, y + 4).lineTo(545, y + 4).strokeColor("#ccc").stroke();
    y += 16;

    const summaryRow = (label, value, bold = false) => {
      doc.fontSize(bold ? 11 : 9).text(label, 380, y);
      doc.text(value, 470, y);
      y += bold ? 20 : 16;
    };
    summaryRow("Subtotal", `Rs. ${Number(order.subtotal).toFixed(2)}`);
    if (Number(order.discountAmount) > 0) {
      summaryRow("Discount", `- Rs. ${Number(order.discountAmount).toFixed(2)}`);
    }
    summaryRow("Shipping", `Rs. ${Number(order.shippingCharge).toFixed(2)}`);
    summaryRow(`GST`, `Rs. ${Number(order.gstAmount).toFixed(2)}`);
    summaryRow("Total", `Rs. ${Number(order.total).toFixed(2)}`, true);

    doc.moveDown(3);
    doc.fontSize(8).fillColor("#888").text(
      "This is a system-generated invoice.",
      50,
      doc.y,
      { align: "center", width: 495 }
    );

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

export async function generateInvoiceNumber(prisma) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const latest = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
  });
  const nextSeq = latest ? Number(latest.invoiceNumber.split("-")[2]) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(6, "0")}`;
}
