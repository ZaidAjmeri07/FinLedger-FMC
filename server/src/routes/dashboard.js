import express from "express";
import auth from "../middleware/auth.js";
import { getDashboardSummary, getDashboardCashflow } from "../controllers/dashboard.js";

const router = express.Router();

router.use(auth);

router.get("/summary", getDashboardSummary);
router.get("/cashflow", getDashboardCashflow);

export default router;
