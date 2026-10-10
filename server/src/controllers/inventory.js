import Inventory from "../models/Inventory.js";

export const getInventories = async (req, res) => {
  try {
    const { name, sku, minStock, location } = req.query;
    const filter = { business: req.user.business };

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (sku) {
      filter.sku = sku;
    }

    if (minStock !== undefined) {
      filter.quantity = { $lte: Number(minStock) };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    const inventories = await Inventory.find(filter).sort({ name: 1 });
    res.json({ inventories });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory", error: err.message });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { name, sku, quantity, minStock, maxStock, unit, costPrice, salePrice, reorderPoint, location, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Inventory item name is required" });
    }

    const inventory = await Inventory.create({
      business: req.user.business,
      name: name.trim(),
      sku: sku || undefined,
      quantity: quantity !== undefined ? Number(quantity) : 0,
      minStock: minStock !== undefined ? Number(minStock) : 0,
      maxStock: maxStock !== undefined,
      unit: unit || "pcs",
      costPrice: costPrice !== undefined ? Number(costPrice) : 0,
      salePrice: salePrice !== undefined ? Number(salePrice) : 0,
      reorderPoint: reorderPoint !== undefined ? Number(reorderPoint) : 0,
      location: location || undefined,
      notes: notes ? notes.trim() : undefined,
    });

    res.status(201).json(inventory);
  } catch (err) {
    res.status(500).json({ message: "Failed to create inventory item", error: err.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, minStock, maxStock, unit, costPrice, salePrice, reorderPoint, location, notes } = req.body;

    const inventory = await Inventory.findOne({ _id: id, business: req.user.business });
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    if (name) inventory.name = name.trim();
    if (sku !== undefined) inventory.sku = sku;
    if (quantity !== undefined) {
      const q = Number(quantity);
      if (isNaN(q) || q < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      inventory.quantity = q;
    }
    if (minStock !== undefined) {
      inventory.minStock = Number(minStock);
    }
    if (maxStock !== undefined) {
      inventory.maxStock = maxStock;
    }
    if (unit) inventory.unit = unit;
    if (costPrice !== undefined) {
      inventory.costPrice = Number(costPrice);
    }
    if (salePrice !== undefined) {
      inventory.salePrice = Number(salePrice);
    }
    if (reorderPoint !== undefined) {
      inventory.reorderPoint = Number(reorderPoint);
    }
    if (location !== undefined) inventory.location = location;
    if (notes !== undefined) inventory.notes = notes ? notes.trim() : "";

    await inventory.save();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: "Failed to update inventory item", error: err.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.findOne({ _id: id, business: req.user.business });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await inventory.deleteOne();
    res.json({ message: "Inventory item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete inventory item", error: err.message });
  }
};

export const adjustInventoryStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange, reason } = req.body;

    if (quantityChange === undefined || quantityChange === null) {
      return res.status(400).json({ message: "Quantity change is required" });
    }

    const inventory = await Inventory.findOne({ _id: id, business: req.user.business });
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const newQuantity = inventory.quantity + Number(quantityChange);
    if (newQuantity < 0) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    inventory.quantity = newQuantity;
    if (reason && reason.trim()) {
      inventory.notes = `${inventory.notes || ""} ${new Date().toLocaleString()}: ${reason.trim()}`.trim();
    }

    await inventory.save();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: "Failed to adjust inventory stock", error: err.message });
  }
};

export const getLowStockItems = async (req, res) => {
  try {
    const { business } = req.user;
    const lowStockItems = await Inventory.find({ business, $expr: { $lte: ["$quantity", "$minStock"] } }).sort({ name: 1 });
    res.json({ lowStockItems });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low stock items", error: err.message });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const { business } = req.user;
    const inventories = await Inventory.find({ business }).sort({ name: 1 });

    const totalItems = inventories.length;
    const totalValue = inventories.reduce((sum, item) => sum + (item.quantity * (item.salePrice || 0)), 0);
    const lowStockCount = inventories.filter(item => item.quantity <= item.minStock).length;
    const outOfStockCount = inventories.filter(item => item.quantity <= 0).length;

    const byUnit = {};
    inventories.forEach(item => {
      const unit = item.unit || "pcs";
      byUnit[unit] = (byUnit[unit] || 0) + 1;
    });

    const valuationByUnit = {};
    inventories.forEach(item => {
      const unit = item.unit || "pcs";
      if (!valuationByUnit[unit]) valuationByUnit[unit] = 0;
      valuationByUnit[unit] += item.quantity * (item.salePrice || 0);
    });

    res.json({
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount,
      byUnit,
      valuationByUnit,
      inventories
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate inventory report", error: err.message });
  }
};