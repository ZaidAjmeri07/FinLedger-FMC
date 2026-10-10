import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roles.js";
import {
  getRecurringTemplates,
  createRecurringTemplate,
  updateRecurringTemplate,
  deleteRecurringTemplate,
  runNowRecurring,
} from "../controllers/recurring.js";

const router = express.Router();

router.use(auth);

router.get("/", getRecurringTemplates);
router.post("/", createRecurringTemplate);
router.post("/run-now", runNowRecurring);
router.put("/:id", updateRecurringTemplate);
router.delete("/:id", requireRole("admin"), deleteRecurringTemplate);

export default router;
