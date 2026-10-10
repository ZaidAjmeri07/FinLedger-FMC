import express from "express";
import auth from "../middleware/auth.js";
import { getExpensesByCategory, getCashFlowReport } from "../controllers/reports.js";

const router = express.Router();

router.use(auth);

router.get("/expenses-by-category", getExpensesByCategory);
router.get("/cashflow", getCashFlowReport);

export default router;
