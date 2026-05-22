import { Router } from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyStoreAccess } from "../middlewares/verifyStoreAccess.middleware";
import {
  EmployeeLevelRoles,
  ManagerLevelRoles,
} from "../constants/userStoreRoles";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyStoreAccess(EmployeeLevelRoles), getProducts);
router.post("/:storeId", verifyStoreAccess(ManagerLevelRoles), createProduct);
router.patch(
  "/:storeId/:productId",
  verifyStoreAccess(ManagerLevelRoles),
  updateProduct,
);
router.delete(
  "/:storeId/:productId",
  verifyStoreAccess(ManagerLevelRoles),
  deleteProduct,
);

export default router;
