import { Router } from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  rearrangeProductImages,
  exportProducts,
} from "../controllers/product.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyEmployeeLevelAccess, getProducts);
router.get("/:storeId/export", verifyEmployeeLevelAccess, exportProducts);
router.post("/:storeId", verifyManagerLevelAccess, createProduct);

router.get("/:storeId/:productId", verifyManagerLevelAccess, getProductById);
router.patch("/:storeId/:productId", verifyManagerLevelAccess, updateProduct);
router.patch(
  "/:storeId/:productId/rearrange-images",
  verifyManagerLevelAccess,
  rearrangeProductImages,
);
router.delete("/:storeId/:productId", verifyManagerLevelAccess, deleteProduct);

export default router;
