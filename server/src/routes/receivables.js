import express from "express";
import auth from "../middleware/auth.js";
import { getOverdueReceivables } from "../controllers/receivables.js";

const router = express.Router();

router.use(auth);

router.get("/overdue", getOverdueReceivables);

export default router;
