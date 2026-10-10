import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["Rent", "Salaries", "Supplies", "Utilities", "Marketing", "Travel", "Other"],
      default: "Other",
    },
    date: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
