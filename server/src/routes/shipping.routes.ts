import { Router } from "express";
import {
  calculateShippingCharge,
  createShippingProfile,
  createShippingRule,
  createShippingZone,
  deleteShippingProfile,
  deleteShippingRule,
  deleteShippingZone,
  getShippingProfileById,
  getShippingProfiles,
  updateShippingProfile,
  updateShippingRule,
  updateShippingZone,
} from "../controllers/shipping.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

// Shipping Calculation Route
router.post(
  "/:storeId/calculate",
  verifyEmployeeLevelAccess,
  calculateShippingCharge,
);

// Shipping Profile Routes
router.get("/:storeId", verifyEmployeeLevelAccess, getShippingProfiles);
router.post("/:storeId", verifyManagerLevelAccess, createShippingProfile);
router.get(
  "/:storeId/:profileId",
  verifyEmployeeLevelAccess,
  getShippingProfileById,
);
router.patch(
  "/:storeId/:profileId",
  verifyManagerLevelAccess,
  updateShippingProfile,
);
router.delete(
  "/:storeId/:profileId",
  verifyManagerLevelAccess,
  deleteShippingProfile,
);

// Shipping Zone Routes
router.post(
  "/:storeId/:profileId/zones",
  verifyManagerLevelAccess,
  createShippingZone,
);
router.patch(
  "/:storeId/zones/:zoneId",
  verifyManagerLevelAccess,
  updateShippingZone,
);
router.delete(
  "/:storeId/zones/:zoneId",
  verifyManagerLevelAccess,
  deleteShippingZone,
);

// Shipping Rule Routes
router.post("/:storeId/rules", verifyManagerLevelAccess, createShippingRule);
router.patch(
  "/:storeId/rules/:ruleId",
  verifyManagerLevelAccess,
  updateShippingRule,
);
router.delete(
  "/:storeId/rules/:ruleId",
  verifyManagerLevelAccess,
  deleteShippingRule,
);

export default router;
