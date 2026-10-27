import { Router } from "express";
import {
  getOrderById,
  createOrder,
  searchOrders,
  updateOrderStatus,
  deleteOrder,
  calculateOrderShipping,
} from "../../controllers/apiKey/order.controller";
import { verifyApiKeyScope } from "../../middlewares/verifyApiKey.middleware";
import {
  ORDER_READ_SCOPES,
  ORDER_CREATE_SCOPES,
  ORDER_WRITE_SCOPES,
  ORDER_DELETE_SCOPES,
} from "../../constants/apiKeyScopes.constant";

const router = Router();

// Calculate shipping
router.post(
  "/calculate-shipping",
  verifyApiKeyScope(ORDER_READ_SCOPES),
  calculateOrderShipping,
);

// Search / list orders
router.get("/", verifyApiKeyScope(ORDER_READ_SCOPES), searchOrders);

// Single order by ID
router.get("/:orderId", verifyApiKeyScope(ORDER_READ_SCOPES), getOrderById);

// Create order
router.post("/", verifyApiKeyScope(ORDER_CREATE_SCOPES), createOrder);

// Update order status
router.patch(
  "/:orderId/status",
  verifyApiKeyScope(ORDER_WRITE_SCOPES),
  updateOrderStatus,
);

// Delete order
router.delete(
  "/:orderId",
  verifyApiKeyScope(ORDER_DELETE_SCOPES),
  deleteOrder,
);

export default router;
