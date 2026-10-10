import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "accountant"], default: "accountant" },
    // For the admin this points to their own user id (their id IS the business id)
    business: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
