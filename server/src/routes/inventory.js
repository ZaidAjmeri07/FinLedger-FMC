import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roles.js";
import {
  getInventories,
  createInventory,
  updateInventory,
  deleteInventory,
  adjustInventoryStock,
  getLowStockItems,
  getInventoryReport,
} from "../controllers/inventory.js";

const router = express.Router();

router.use(auth);

router.get("/", getInventories);
router.post("/", createInventory);
router.put("/:id", updateInventory);
router.delete("/:id", requireRole("admin"), deleteInventory);
router.post("/:id/adjust", adjustInventoryStock);
router.get("/low-stock", getLowStockItems);
router.get("/report", getInventoryReport);

export default router;