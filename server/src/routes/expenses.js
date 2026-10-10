import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roles.js";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenses.js";

const router = express.Router();

router.use(auth);

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", requireRole("admin"), deleteExpense);

export default router;
