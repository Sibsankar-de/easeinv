import { Router } from "express";
import {
  createOrder,
  searchOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyEmployeeLevelAccess } from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyEmployeeLevelAccess, searchOrders);
router.post("/:storeId", verifyEmployeeLevelAccess, createOrder);

router.get("/:storeId/:orderId", verifyEmployeeLevelAccess, getOrderById);
router.delete("/:storeId/:orderId", verifyEmployeeLevelAccess, deleteOrder);

router.patch(
  "/:storeId/:orderId/status",
  verifyEmployeeLevelAccess,
  updateOrderStatus,
);

export default router;
