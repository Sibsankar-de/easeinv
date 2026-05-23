import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyManagerLevelAccess } from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyManagerLevelAccess, getDashboardAnalytics);

export default router;
