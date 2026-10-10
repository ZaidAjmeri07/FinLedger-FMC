import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  try {
    const { category, from, to } = req.query;
    const filter = { business: req.user.business };

    if (category) {
      filter.category = category;
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    res.json({
      total: Math.round(totalAmount * 100) / 100,
      count: expenses.length,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses", error: err.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Expense title is required" });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: "Expense amount must be greater than zero" });
    }

    const expense = await Expense.create({
      business: req.user.business,
      title: title.trim(),
      amount: Math.round(numAmount * 100) / 100,
      category: category || "Other",
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : undefined,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to create expense", error: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, notes } = req.body;

    const expense = await Expense.findOne({ _id: id, business: req.user.business });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (title) expense.title = title.trim();
    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ message: "Invalid expense amount" });
      }
      expense.amount = Math.round(num * 100) / 100;
    }
    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes ? notes.trim() : "";

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to update expense", error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOne({ _id: id, business: req.user.business });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete expense", error: err.message });
  }
};
