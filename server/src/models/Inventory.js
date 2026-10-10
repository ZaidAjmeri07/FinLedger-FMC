import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      sparse: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      default: "pcs",
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    salePrice: {
      type: Number,
    },
    reorderPoint: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);