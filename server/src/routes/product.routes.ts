import { Router } from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/product.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyEmployeeLevelAccess, getProducts);
router.post("/:storeId", verifyManagerLevelAccess, createProduct);
router.get("/:storeId/:productId", verifyManagerLevelAccess, getProductById);
router.patch("/:storeId/:productId", verifyManagerLevelAccess, updateProduct);
router.delete("/:storeId/:productId", verifyManagerLevelAccess, deleteProduct);

export default router;
