import fs from "fs";
import path from "path";
import { prisma } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";
import { generateInvoicePdf } from "../services/invoice.service.js";

export async function downloadInvoice(req, res, next) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.orderId },
    include: { invoice: true, user: true, items: { include: { product: true } } },
  });
  if (!order || (order.userId !== req.user.id && req.user.role !== "ADMIN")) {
    return next(new ApiError(404, "Order not found."));
  }
  if (!order.invoice) {
    return next(new ApiError(404, "No invoice has been generated for this order yet."));
  }

  const { invoiceNumber, issuedAt } = order.invoice;
  const filePath = path.resolve("uploads/invoices", `${invoiceNumber}.pdf`);

  // The hosting platform's disk is ephemeral: PDFs saved at purchase time disappear on the next
  // redeploy. The invoice record (and all order data) lives in the database, so rebuild the
  // identical PDF from it whenever the file is missing.
  if (!fs.existsSync(filePath)) {
    await generateInvoicePdf({ order, invoiceNumber, issuedAt });
  }

  res.download(filePath, `${invoiceNumber}.pdf`, (err) => {
    if (err && !res.headersSent) next(new ApiError(404, "Invoice file not found."));
  });
}
