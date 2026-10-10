import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roles.js";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customers.js";

const router = express.Router();

router.use(auth);

router.get("/", getCustomers);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", requireRole("admin"), deleteCustomer);

export default router;
