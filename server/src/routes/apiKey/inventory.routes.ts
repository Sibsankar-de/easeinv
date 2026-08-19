import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  exportProducts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/apiKey/inventory.controller";
import { verifyApiKeyScope } from "../../middlewares/verifyApiKey.middleware";
import {
  INVENTORY_READ_SCOPES,
  INVENTORY_WRITE_SCOPES,
  INVENTORY_DELETE_SCOPES,
  CATEGORY_READ_SCOPES,
  CATEGORY_WRITE_SCOPES,
  CATEGORY_DELETE_SCOPES,
} from "../../constants/apiKeyScopes.constant";

const router = Router();

// Search & Export (must precede parameterized :productId routes)
router.get(
  "/products/search",
  verifyApiKeyScope(INVENTORY_READ_SCOPES),
  searchProducts,
);
router.get("/search", verifyApiKeyScope(INVENTORY_READ_SCOPES), searchProducts);

router.get(
  "/products/export",
  verifyApiKeyScope(INVENTORY_READ_SCOPES),
  exportProducts,
);
router.get("/export", verifyApiKeyScope(INVENTORY_READ_SCOPES), exportProducts);

// Category routes
router.get(
  "/categories",
  verifyApiKeyScope(CATEGORY_READ_SCOPES),
  getCategories,
);
router.post(
  "/categories",
  verifyApiKeyScope(CATEGORY_WRITE_SCOPES),
  createCategory,
);
router.patch(
  "/categories/:categoryId",
  verifyApiKeyScope(CATEGORY_WRITE_SCOPES),
  updateCategory,
);
router.delete(
  "/categories/:categoryId",
  verifyApiKeyScope(CATEGORY_DELETE_SCOPES),
  deleteCategory,
);

// Products by ID
router.get(
  "/products/:productId",
  verifyApiKeyScope(INVENTORY_READ_SCOPES),
  getProductById,
);
router.get(
  "/:productId",
  verifyApiKeyScope(INVENTORY_READ_SCOPES),
  getProductById,
);

router.patch(
  "/products/:productId",
  verifyApiKeyScope(INVENTORY_WRITE_SCOPES),
  updateProduct,
);
router.patch(
  "/:productId",
  verifyApiKeyScope(INVENTORY_WRITE_SCOPES),
  updateProduct,
);

router.delete(
  "/products/:productId",
  verifyApiKeyScope(INVENTORY_DELETE_SCOPES),
  deleteProduct,
);
router.delete(
  "/:productId",
  verifyApiKeyScope(INVENTORY_DELETE_SCOPES),
  deleteProduct,
);

// Products list and create
router.get("/products", verifyApiKeyScope(INVENTORY_READ_SCOPES), getProducts);
router.post(
  "/products",
  verifyApiKeyScope(INVENTORY_WRITE_SCOPES),
  createProduct,
);

router.get("/", verifyApiKeyScope(INVENTORY_READ_SCOPES), getProducts);
router.post("/", verifyApiKeyScope(INVENTORY_WRITE_SCOPES), createProduct);

export default router;
