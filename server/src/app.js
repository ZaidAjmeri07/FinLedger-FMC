import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import invoiceRoutes from "./routes/invoices.js";
import expenseRoutes from "./routes/expenses.js";
import inventoryRoutes from "./routes/inventory.js";
import recurringRoutes from "./routes/recurring.js";
import dashboardRoutes from "./routes/dashboard.js";
import receivablesRoutes from "./routes/receivables.js";
import reportsRoutes from "./routes/reports.js";
import teamRoutes from "./routes/team.js";
import { initScheduler } from "./jobs/scheduler.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    dbReady: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  })
);

// DB readiness guard - prevent 10s buffering timeout when DB is disconnected
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        "Database is currently connecting or unreachable. Please verify that your current IP address is whitelisted in MongoDB Atlas Network Access (or set to 0.0.0.0/0 for development).",
      code: "DB_NOT_CONNECTED",
    });
  }
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/receivables", receivablesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/team", teamRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB().then(() => {
    initScheduler();
  });
});
