import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";
import Customer from "../models/Customer.js";
import { calculateCashFlow } from "../services/finance.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const businessId = req.user.business;
    const now = new Date();

    const [invoices, expenses, totalCustomers] = await Promise.all([
      Invoice.find({ business: businessId }).populate("customer", "name email").sort({ createdAt: -1 }),
      Expense.find({ business: businessId }),
      Customer.countDocuments({ business: businessId }),
    ]);

    let revenue = 0;
    let outstanding = 0;
    let overdue = 0;
    const recentPayments = [];

    for (const inv of invoices) {
      const payments = inv.payments || [];
      for (const p of payments) {
        revenue += Number(p.amount) || 0;
        recentPayments.push({
          invoiceId: inv._id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customer?.name || "Customer",
          amount: p.amount,
          date: p.date,
          method: p.method,
        });
      }

      const balance = Math.max(0, (inv.total || 0) - (inv.amountPaid || 0));
      if (balance > 0) {
        outstanding += balance;
        if (inv.dueDate && new Date(inv.dueDate) < now) {
          overdue += balance;
        }
      }
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const profit = Math.round((revenue - totalExpenses) * 100) / 100;

    // Sort recent payments
    recentPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      revenue: Math.round(revenue * 100) / 100,
      expenses: Math.round(totalExpenses * 100) / 100,
      profit,
      outstanding: Math.round(outstanding * 100) / 100,
      overdue: Math.round(overdue * 100) / 100,
      totalInvoices: invoices.length,
      totalCustomers,
      recentInvoices: invoices.slice(0, 5),
      recentPayments: recentPayments.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard summary", error: err.message });
  }
};

export const getDashboardCashflow = async (req, res) => {
  try {
    const businessId = req.user.business;

    const [invoices, expenses] = await Promise.all([
      Invoice.find({ business: businessId }),
      Expense.find({ business: businessId }),
    ]);

    const cashflowData = calculateCashFlow(invoices, expenses, 6);
    res.json(cashflowData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard cash flow", error: err.message });
  }
};
