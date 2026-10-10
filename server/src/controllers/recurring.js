import RecurringTemplate from "../models/RecurringTemplate.js";
import Customer from "../models/Customer.js";
import { processRecurringTemplates } from "../services/recurring.js";

export const getRecurringTemplates = async (req, res) => {
  try {
    const templates = await RecurringTemplate.find({ business: req.user.business })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recurring templates", error: err.message });
  }
};

export const createRecurringTemplate = async (req, res) => {
  try {
    const { customer, items, tax, frequency, dueInDays, nextRunDate, active } = req.body;

    if (!customer) {
      return res.status(400).json({ message: "Customer is required" });
    }

    if (!frequency || !["weekly", "monthly", "quarterly", "yearly"].includes(frequency)) {
      return res.status(400).json({ message: "Valid frequency is required (weekly, monthly, quarterly, yearly)" });
    }

    const customerExists = await Customer.findOne({ _id: customer, business: req.user.business });
    if (!customerExists) {
      return res.status(404).json({ message: "Selected customer does not exist" });
    }

    const template = await RecurringTemplate.create({
      business: req.user.business,
      customer,
      items: items || [],
      tax: Number(tax) || 0,
      frequency,
      dueInDays: Number(dueInDays) || 15,
      nextRunDate: nextRunDate ? new Date(nextRunDate) : new Date(),
      active: active !== undefined ? active : true,
    });

    const populated = await template.populate("customer", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create recurring template", error: err.message });
  }
};

export const updateRecurringTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer, items, tax, frequency, dueInDays, nextRunDate, active } = req.body;

    const template = await RecurringTemplate.findOne({ _id: id, business: req.user.business });
    if (!template) {
      return res.status(404).json({ message: "Recurring template not found" });
    }

    if (customer) {
      const customerExists = await Customer.findOne({ _id: customer, business: req.user.business });
      if (!customerExists) {
        return res.status(404).json({ message: "Selected customer does not exist" });
      }
      template.customer = customer;
    }

    if (items !== undefined) template.items = items;
    if (tax !== undefined) template.tax = Number(tax) || 0;
    if (frequency) template.frequency = frequency;
    if (dueInDays !== undefined) template.dueInDays = Number(dueInDays);
    if (nextRunDate) template.nextRunDate = new Date(nextRunDate);
    if (active !== undefined) template.active = Boolean(active);

    await template.save();
    const populated = await template.populate("customer", "name email");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update recurring template", error: err.message });
  }
};

export const deleteRecurringTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await RecurringTemplate.findOne({ _id: id, business: req.user.business });

    if (!template) {
      return res.status(404).json({ message: "Recurring template not found" });
    }

    await template.deleteOne();
    res.json({ message: "Recurring template deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete recurring template", error: err.message });
  }
};

export const runNowRecurring = async (req, res) => {
  try {
    const result = await processRecurringTemplates(req.user.business);
    res.json({
      message: `Triggered recurring generation: ${result.generatedInvoices} invoice(s) created.`,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to run recurring template execution", error: err.message });
  }
};
