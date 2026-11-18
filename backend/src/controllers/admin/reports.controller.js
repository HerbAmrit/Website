import PDFDocument from "pdfkit";
import { prisma } from "../../config/db.js";

function toCsvValue(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function dateRangeWhere(from, to) {
  if (!from && !to) return {};
  return {
    createdAt: {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    },
  };
}

// GET /api/admin/reports/export?format=csv|pdf&from=&to=
export async function exportReport(req, res, next) {
  const { format = "csv", from, to } = req.query;
  const orders = await prisma.order.findMany({
    where: dateRangeWhere(from, to),
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  if (format === "pdf") return exportPdf(res, orders, { from, to });
  return exportCsv(res, orders);
}

function exportCsv(res, orders) {
  const headers = ["Order Number", "Date", "Customer", "Email", "Status", "Payment Status", "Subtotal", "Discount", "Shipping", "GST", "Total"];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt.toISOString().slice(0, 10),
    o.user.name,
    o.user.email,
    o.status,
    o.paymentStatus,
    o.subtotal,
    o.discountAmount,
    o.shippingCharge,
    o.gstAmount,
    o.total,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(toCsvValue).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="sales-report-${Date.now()}.csv"`);
  res.send(csv);
}

function exportPdf(res, orders, { from, to }) {
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="sales-report-${Date.now()}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(18).text("Sales Report");
  doc.fontSize(9).fillColor("#555").text(`Generated ${new Date().toLocaleString("en-IN")}`);
  if (from || to) doc.text(`Range: ${from || "start"} to ${to || "now"}`);
  doc.fillColor("#000").moveDown();

  doc.fontSize(11);
  doc.text(`Total orders: ${orders.length}`);
  doc.text(`Paid orders: ${paidOrders.length}`);
  doc.text(`Total revenue: Rs. ${totalRevenue.toFixed(2)}`);
  doc.moveDown();

  let y = doc.y;
  doc.fontSize(9).fillColor("#555");
  doc.text("Order #", 50, y);
  doc.text("Date", 150, y);
  doc.text("Customer", 220, y);
  doc.text("Status", 370, y);
  doc.text("Total", 470, y);
  y += 14;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#ccc").stroke();
  y += 8;
  doc.fillColor("#000");

  for (const o of orders) {
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(9);
    doc.text(o.orderNumber, 50, y, { width: 95 });
    doc.text(o.createdAt.toISOString().slice(0, 10), 150, y);
    doc.text(o.user.name, 220, y, { width: 140 });
    doc.text(o.status, 370, y);
    doc.text(`Rs. ${Number(o.total).toFixed(2)}`, 470, y);
    y += 16;
  }

  doc.end();
}
