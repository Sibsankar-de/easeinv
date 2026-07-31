import { Router } from "express";
import {
  getCategoryAnalytics,
  getCustomerAnalytics,
  getDashboardAnalytics,
  getProductAnalytics,
  getSalesAnalytics,
} from "../controllers/analytics.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyManagerLevelAccess } from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

// Dedicated Analytics Endpoints (all filters passed via query params)
router.get(
  "/:storeId/dashboard",
  verifyManagerLevelAccess,
  getDashboardAnalytics,
);
router.get("/:storeId/sales", verifyManagerLevelAccess, getSalesAnalytics);
router.get("/:storeId/products", verifyManagerLevelAccess, getProductAnalytics);
router.get(
  "/:storeId/categories",
  verifyManagerLevelAccess,
  getCategoryAnalytics,
);
router.get(
  "/:storeId/customers",
  verifyManagerLevelAccess,
  getCustomerAnalytics,
);

// Legacy Alias Endpoint
router.get("/:storeId", verifyManagerLevelAccess, getDashboardAnalytics);

export default router;
