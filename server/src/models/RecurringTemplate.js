import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const recurringTemplateSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [itemSchema], default: [] },
    tax: { type: Number, default: 0 },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      required: true,
    },
    dueInDays: { type: Number, default: 15 },
    nextRunDate: { type: Date, required: true },
    lastRunAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("RecurringTemplate", recurringTemplateSchema);
