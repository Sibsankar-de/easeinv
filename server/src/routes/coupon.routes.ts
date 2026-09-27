import { Router } from "express";
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyEmployeeLevelAccess, getCoupons);
router.post("/:storeId", verifyManagerLevelAccess, createCoupon);

router.get("/:storeId/:couponId", verifyEmployeeLevelAccess, getCouponById);
router.patch("/:storeId/:couponId", verifyManagerLevelAccess, updateCoupon);
router.delete("/:storeId/:couponId", verifyManagerLevelAccess, deleteCoupon);

export default router;
