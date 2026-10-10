import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import { calculateCashFlow } from "../services/finance.js";

export const getExpensesByCategory = async (req, res) => {
  try {
    const businessId = req.user.business;
    const { from, to } = req.query;

    const filter = { business: businessId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const expenses = await Expense.find(filter);
    const categoryTotals = {};
    let grandTotal = 0;

    for (const exp of expenses) {
      const cat = exp.category || "Other";
      const amt = Number(exp.amount) || 0;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      grandTotal += amt;
    }

    const categories = Object.keys(categoryTotals).map((cat) => ({
      category: cat,
      amount: Math.round(categoryTotals[cat] * 100) / 100,
      percentage: grandTotal > 0 ? Math.round((categoryTotals[cat] / grandTotal) * 1000) / 10 : 0,
    }));

    categories.sort((a, b) => b.amount - a.amount);

    res.json({
      total: Math.round(grandTotal * 100) / 100,
      count: expenses.length,
      categories,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate expense report", error: err.message });
  }
};

export const getCashFlowReport = async (req, res) => {
  try {
    const businessId = req.user.business;
    const months = Number(req.query.months) || 12;

    const [invoices, expenses] = await Promise.all([
      Invoice.find({ business: businessId }),
      Expense.find({ business: businessId }),
    ]);

    const report = calculateCashFlow(invoices, expenses, months);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate cash flow report", error: err.message });
  }
};
