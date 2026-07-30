import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyEmployeeLevelAccess } from "../middlewares/verifyStoreAccess.middleware";
import {
  createCategory,
  getCategoriesByStore,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";

const router = Router();

router.use(verifyAuth);

router.route("/:storeId").post(verifyEmployeeLevelAccess, createCategory);

router
  .route("/:storeId/list")
  .get(verifyEmployeeLevelAccess, getCategoriesByStore);

router
  .route("/:storeId/:categoryId")
  .patch(verifyEmployeeLevelAccess, updateCategory)
  .delete(verifyEmployeeLevelAccess, deleteCategory);

export default router;
