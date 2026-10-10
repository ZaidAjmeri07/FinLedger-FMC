import RecurringTemplate from "../models/RecurringTemplate.js";
import Invoice from "../models/Invoice.js";
import { calculateInvoiceTotals } from "./finance.js";

/**
 * Generates the next sequential invoice number for a given business
 */
export const getNextInvoiceNumber = async (businessId) => {
  const lastInvoice = await Invoice.findOne({ business: businessId })
    .sort({ createdAt: -1 })
    .select("invoiceNumber");

  let nextSeq = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    } else {
      const count = await Invoice.countDocuments({ business: businessId });
      nextSeq = count + 1;
    }
  }

  return `INV-${String(nextSeq).padStart(4, "0")}`;
};

/**
 * Computes next run date based on frequency
 */
export const computeNextDate = (currentDate, frequency) => {
  const d = new Date(currentDate);
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
};

/**
 * Scans and executes due recurring templates
 * If businessId is provided, processes only for that business
 */
export const processRecurringTemplates = async (businessId = null) => {
  const now = new Date();
  const query = {
    active: true,
    nextRunDate: { $lte: now },
  };

  if (businessId) {
    query.business = businessId;
  }

  const templates = await RecurringTemplate.find(query);
  const createdInvoices = [];

  for (const template of templates) {
    let nextRun = new Date(template.nextRunDate);
    const maxIterations = 5; // prevent runaway loops
    let iterations = 0;

    while (nextRun <= now && iterations < maxIterations) {
      iterations++;
      const { subtotal, tax, total } = calculateInvoiceTotals(template.items, template.tax);

      const invoiceNumber = await getNextInvoiceNumber(template.business);
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (template.dueInDays || 15));

      const newInvoice = await Invoice.create({
        business: template.business,
        customer: template.customer,
        invoiceNumber,
        issueDate,
        dueDate,
        items: template.items,
        subtotal,
        tax,
        total,
        payments: [],
        amountPaid: 0,
        status: "sent",
        recurringSource: template._id,
        notes: `Auto-generated from recurring template (${template.frequency})`,
      });

      createdInvoices.push(newInvoice);

      // Advance nextRun
      nextRun = computeNextDate(nextRun, template.frequency);
    }

    template.nextRunDate = nextRun;
    template.lastRunAt = now;
    await template.save();
  }

  return {
    processedTemplates: templates.length,
    generatedInvoices: createdInvoices.length,
    invoices: createdInvoices,
  };
};
