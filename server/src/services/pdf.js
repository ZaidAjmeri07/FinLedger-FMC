import PDFDocument from "pdfkit";

/**
 * Streams an invoice PDF to the response stream
 */
export const buildInvoicePDF = (invoice, user, res) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  // Stream output directly to client response
  doc.pipe(res);

  const primaryColor = "#1e293b"; // Slate-800
  const accentColor = "#2563eb"; // Blue-600
  const lightGray = "#64748b"; // Slate-500
  const borderColor = "#e2e8f0";

  // HEADER
  doc
    .fillColor(accentColor)
    .fontSize(22)
    .text(user?.businessName || "FinLedger Business", 40, 40)
    .fontSize(10)
    .fillColor(lightGray)
    .text("Financial Operations & Invoicing", 40, 68);

  doc
    .fontSize(20)
    .fillColor(primaryColor)
    .text("INVOICE", 400, 40, { align: "right" })
    .fontSize(11)
    .fillColor(accentColor)
    .text(invoice.invoiceNumber, 400, 66, { align: "right" });

  // Horizontal divider
  doc.strokeColor(borderColor).lineWidth(1).moveTo(40, 95).lineTo(555, 95).stroke();

  // INVOICE METADATA & BILL TO
  const metaY = 110;

  // Bill To (Left)
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(lightGray)
    .text("BILLED TO:", 40, metaY)
    .font("Helvetica")
    .fontSize(11)
    .fillColor(primaryColor)
    .text(invoice.customer?.name || "Customer", 40, metaY + 16);

  let currentY = metaY + 30;
  if (invoice.customer?.email) {
    doc.fontSize(9).fillColor(lightGray).text(invoice.customer.email, 40, currentY);
    currentY += 13;
  }
  if (invoice.customer?.phone) {
    doc.fontSize(9).fillColor(lightGray).text(invoice.customer.phone, 40, currentY);
    currentY += 13;
  }
  if (invoice.customer?.address) {
    doc.fontSize(9).fillColor(lightGray).text(invoice.customer.address, 40, currentY);
    currentY += 13;
  }

  // Invoice Details (Right)
  const rightColX = 350;
  const issueDateStr = invoice.issueDate
    ? new Date(invoice.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "N/A";
  const dueDateStr = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "N/A";

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(lightGray)
    .text("Issue Date:", rightColX, metaY)
    .font("Helvetica")
    .fillColor(primaryColor)
    .text(issueDateStr, 460, metaY, { align: "right" });

  doc
    .font("Helvetica-Bold")
    .fillColor(lightGray)
    .text("Due Date:", rightColX, metaY + 16)
    .font("Helvetica")
    .fillColor(primaryColor)
    .text(dueDateStr, 460, metaY + 16, { align: "right" });

  doc
    .font("Helvetica-Bold")
    .fillColor(lightGray)
    .text("Status:", rightColX, metaY + 32)
    .font("Helvetica-Bold")
    .fillColor(invoice.status === "paid" ? "#16a34a" : invoice.status === "overdue" ? "#dc2626" : accentColor)
    .text(invoice.status.toUpperCase(), 460, metaY + 32, { align: "right" });

  // ITEMS TABLE HEADER
  const tableTopY = Math.max(currentY + 20, 190);
  doc.rect(40, tableTopY, 515, 24).fill("#f8fafc");

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(lightGray)
    .text("DESCRIPTION", 50, tableTopY + 7)
    .text("QTY", 330, tableTopY + 7, { align: "center", width: 40 })
    .text("UNIT PRICE", 390, tableTopY + 7, { align: "right", width: 60 })
    .text("TOTAL", 480, tableTopY + 7, { align: "right", width: 65 });

  // LINE ITEMS
  let itemY = tableTopY + 28;
  const items = invoice.items || [];

  doc.font("Helvetica").fontSize(9);

  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const itemTotal = (qty * price).toFixed(2);

    doc
      .fillColor(primaryColor)
      .text(item.description || "Item", 50, itemY, { width: 260 })
      .text(String(qty), 330, itemY, { align: "center", width: 40 })
      .text(`$${price.toFixed(2)}`, 390, itemY, { align: "right", width: 60 })
      .text(`$${itemTotal}`, 480, itemY, { align: "right", width: 65 });

    itemY += 22;
    doc.strokeColor(borderColor).lineWidth(0.5).moveTo(40, itemY - 4).lineTo(555, itemY - 4).stroke();
  }

  // TOTALS SECTION
  const totalsY = itemY + 15;
  const totalsX = 350;

  const subtotal = (Number(invoice.subtotal) || 0).toFixed(2);
  const tax = (Number(invoice.tax) || 0).toFixed(2);
  const total = (Number(invoice.total) || 0).toFixed(2);
  const amountPaid = (Number(invoice.amountPaid) || 0).toFixed(2);
  const balance = Math.max(0, Number(invoice.total || 0) - Number(invoice.amountPaid || 0)).toFixed(2);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(lightGray)
    .text("Subtotal:", totalsX, totalsY)
    .fillColor(primaryColor)
    .text(`$${subtotal}`, 460, totalsY, { align: "right" });

  doc
    .fillColor(lightGray)
    .text("Tax:", totalsX, totalsY + 16)
    .fillColor(primaryColor)
    .text(`$${tax}`, 460, totalsY + 16, { align: "right" });

  doc
    .font("Helvetica-Bold")
    .fillColor(primaryColor)
    .text("Total:", totalsX, totalsY + 34)
    .text(`$${total}`, 460, totalsY + 34, { align: "right" });

  doc
    .font("Helvetica")
    .fillColor(lightGray)
    .text("Amount Paid:", totalsX, totalsY + 52)
    .fillColor("#16a34a")
    .text(`$${amountPaid}`, 460, totalsY + 52, { align: "right" });

  // Highlight Balance Box
  doc.rect(totalsX - 10, totalsY + 70, 215, 26).fill("#eff6ff");
  doc
    .font("Helvetica-Bold")
    .fillColor(accentColor)
    .text("Balance Due:", totalsX, totalsY + 78)
    .text(`$${balance}`, 460, totalsY + 78, { align: "right" });

  // NOTES / FOOTER
  if (invoice.notes) {
    const notesY = totalsY + 110;
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(lightGray)
      .text("NOTES / TERMS:", 40, notesY)
      .font("Helvetica")
      .fillColor(primaryColor)
      .text(invoice.notes, 40, notesY + 14, { width: 280 });
  }

  // Footer banner
  doc
    .fontSize(8)
    .fillColor(lightGray)
    .text("Generated by FinLedger • Financial Operations Platform", 40, 780, { align: "center", width: 515 });

  doc.end();
};
