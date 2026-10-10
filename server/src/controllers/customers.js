import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ business: req.user.business }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch customers", error: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    const customer = await Customer.create({
      business: req.user.business,
      name: name.trim(),
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      address: address ? address.trim() : undefined,
    });

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: "Failed to create customer", error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const customer = await Customer.findOne({ _id: id, business: req.user.business });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (name) customer.name = name.trim();
    if (email !== undefined) customer.email = email ? email.trim() : "";
    if (phone !== undefined) customer.phone = phone ? phone.trim() : "";
    if (address !== undefined) customer.address = address ? address.trim() : "";

    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Failed to update customer", error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({ _id: id, business: req.user.business });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if customer has any invoices
    const invoiceCount = await Invoice.countDocuments({ customer: id, business: req.user.business });
    if (invoiceCount > 0) {
      return res.status(400).json({
        message: `Cannot delete customer with ${invoiceCount} linked invoice(s). Archive or delete invoices first.`,
      });
    }

    await customer.deleteOne();
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete customer", error: err.message });
  }
};
