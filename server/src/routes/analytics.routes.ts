import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyStoreAccess } from "../middlewares/verifyStoreAccess.middleware";
import { ManagerLevelRoles } from "../constants/userStoreRoles";

const router = Router();

router.use(verifyAuth);

router.get(
  "/:storeId",
  verifyStoreAccess(ManagerLevelRoles),
  getDashboardAnalytics,
);

export default router;
