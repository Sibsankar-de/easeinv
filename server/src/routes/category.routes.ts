import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyEmployeeLevelAccess } from "../middlewares/verifyStoreAccess.middleware";
import {
  createCategory,
  getCategoriesByStore,
} from "../controllers/category.controller";

const router = Router();

router
  .route("/:storeId")
  .post(verifyAuth, verifyEmployeeLevelAccess, createCategory);
router
  .route("/:storeId/list")
  .get(verifyAuth, verifyEmployeeLevelAccess, getCategoriesByStore);

export default router;
