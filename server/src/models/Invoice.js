import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    method: { type: String, trim: true, default: "cash" },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    invoiceNumber: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    items: { type: [itemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    payments: { type: [paymentSchema], default: [] },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "partial", "paid", "overdue"],
      default: "draft",
    },
    recurringSource: { type: mongoose.Schema.Types.ObjectId, ref: "RecurringTemplate" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Invoice numbers are sequential per business
invoiceSchema.index({ business: 1, invoiceNumber: 1 }, { unique: true });

export default mongoose.model("Invoice", invoiceSchema);
