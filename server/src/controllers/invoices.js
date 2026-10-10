import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import { calculateInvoiceTotals, calculatePaymentStatus } from "../services/finance.js";
import { getNextInvoiceNumber } from "../services/recurring.js";
import { buildInvoicePDF } from "../services/pdf.js";

export const getInvoices = async (req, res) => {
  try {
    const { status, customer } = req.query;
    const filter = { business: req.user.business };

    if (customer) {
      filter.customer = customer;
    }

    if (status) {
      filter.status = status;
    }

    const invoices = await Invoice.find(filter)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    // Update overdue status on read if due date has passed and not paid
    const now = new Date();
    const updatedInvoices = invoices.map((inv) => {
      const balance = Math.max(0, inv.total - inv.amountPaid);
      let effectiveStatus = inv.status;
      if (balance > 0 && inv.dueDate && new Date(inv.dueDate) < now && inv.status !== "draft") {
        effectiveStatus = "overdue";
      }
      return {
        ...inv.toObject(),
        balance,
        status: effectiveStatus,
      };
    });

    res.json(updatedInvoices);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch invoices", error: err.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { customer, dueDate, items = [], tax = 0, notes, status = "sent" } = req.body;

    if (!customer) {
      return res.status(400).json({ message: "Customer is required" });
    }

    if (!dueDate) {
      return res.status(400).json({ message: "Due date is required" });
    }

    // Verify customer belongs to this business
    const customerExists = await Customer.findOne({ _id: customer, business: req.user.business });
    if (!customerExists) {
      return res.status(404).json({ message: "Selected customer does not exist" });
    }

    const { subtotal, tax: calculatedTax, total } = calculateInvoiceTotals(items, tax);
    const invoiceNumber = await getNextInvoiceNumber(req.user.business);

    const invoice = await Invoice.create({
      business: req.user.business,
      customer,
      invoiceNumber,
      issueDate: req.body.issueDate || new Date(),
      dueDate,
      items,
      subtotal,
      tax: calculatedTax,
      total,
      payments: [],
      amountPaid: 0,
      status: status || "sent",
      notes: notes ? notes.trim() : undefined,
    });

    const populated = await invoice.populate("customer", "name email phone");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create invoice", error: err.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOne({ _id: id, business: req.user.business })
      .populate("customer", "name email phone address")
      .populate("recurringSource", "frequency");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const balance = Math.max(0, invoice.total - invoice.amountPaid);
    const result = invoice.toObject();
    result.balance = balance;

    // Check overdue
    if (balance > 0 && invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== "draft") {
      result.status = "overdue";
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve invoice", error: err.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer, dueDate, items, tax, notes, status } = req.body;

    const invoice = await Invoice.findOne({ _id: id, business: req.user.business });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (customer) {
      const customerExists = await Customer.findOne({ _id: customer, business: req.user.business });
      if (!customerExists) {
        return res.status(404).json({ message: "Selected customer not found" });
      }
      invoice.customer = customer;
    }

    if (dueDate) invoice.dueDate = dueDate;
    if (notes !== undefined) invoice.notes = notes ? notes.trim() : "";

    if (items || tax !== undefined) {
      const newItems = items !== undefined ? items : invoice.items;
      const newTax = tax !== undefined ? tax : invoice.tax;
      const { subtotal, tax: calculatedTax, total } = calculateInvoiceTotals(newItems, newTax);
      invoice.items = newItems;
      invoice.subtotal = subtotal;
      invoice.tax = calculatedTax;
      invoice.total = total;
    }

    // Recompute payment status
    const paymentStatus = calculatePaymentStatus(invoice.total, invoice.payments, invoice.dueDate, status || invoice.status);
    invoice.amountPaid = paymentStatus.amountPaid;
    invoice.status = paymentStatus.status;

    await invoice.save();
    const populated = await invoice.populate("customer", "name email phone");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update invoice", error: err.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOne({ _id: id, business: req.user.business });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    await invoice.deleteOne();
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete invoice", error: err.message });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, method } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than zero" });
    }

    const invoice = await Invoice.findOne({ _id: id, business: req.user.business });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const currentBalance = Math.max(0, invoice.total - invoice.amountPaid);
    if (numAmount > currentBalance) {
      return res.status(400).json({
        message: `Payment amount ($${numAmount}) exceeds remaining balance ($${currentBalance})`,
      });
    }

    const paymentEntry = {
      amount: Math.round(numAmount * 100) / 100,
      date: date ? new Date(date) : new Date(),
      method: method ? method.trim() : "Bank Transfer",
    };

    invoice.payments.push(paymentEntry);

    const paymentStatus = calculatePaymentStatus(
      invoice.total,
      invoice.payments,
      invoice.dueDate,
      invoice.status
    );

    invoice.amountPaid = paymentStatus.amountPaid;
    invoice.status = paymentStatus.status;

    await invoice.save();
    const populated = await invoice.populate("customer", "name email phone");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to record payment", error: err.message });
  }
};

export const getInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findOne({ _id: id, business: req.user.business }).populate(
      "customer",
      "name email phone address"
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );

    buildInvoicePDF(invoice, req.user, res);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate invoice PDF", error: err.message });
  }
};
