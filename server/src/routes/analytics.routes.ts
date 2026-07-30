import { Router } from "express";
import {
  getDashboardAnalytics,
  getSalesAnalytics,
} from "../controllers/analytics.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyManagerLevelAccess } from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

// Dedicated Analytics Endpoints
router.get("/:storeId/dashboard", verifyManagerLevelAccess, getDashboardAnalytics);
router.get("/:storeId/sales", verifyManagerLevelAccess, getSalesAnalytics);

// Legacy Alias Endpoint
router.get("/:storeId", verifyManagerLevelAccess, getDashboardAnalytics);

export default router;
