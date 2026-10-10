import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roles.js";
import {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  getInvoicePDF,
} from "../controllers/invoices.js";

const router = express.Router();

router.use(auth);

router.get("/", getInvoices);
router.post("/", createInvoice);
router.get("/:id", getInvoiceById);
router.put("/:id", updateInvoice);
router.delete("/:id", requireRole("admin"), deleteInvoice);
router.post("/:id/payments", recordPayment);
router.get("/:id/pdf", getInvoicePDF);

export default router;
