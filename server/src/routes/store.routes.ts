import { Router } from "express";
import {
  createStore,
  getStoreList,
  getStoreDetails,
  updateStore,
  deleteStore,
  getCustomerList,
  updateStoreSettings,
  uploadStoreLogo,
  uploadInvoicePaymentQrCode,
  getCategoriesByStore,
  createCategory,
} from "../controllers/store.controller";
import {
  getStoreUsers,
  addStoreUser,
  updateStoreUserRole,
  removeStoreUser,
} from "../controllers/store-access.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.use(verifyAuth);

router.post("/create", createStore);
router.get("/list", getStoreList);
router.get("/:storeId", getStoreDetails);
router.patch(
  "/:storeId",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "qrCode", maxCount: 1 },
  ]),
  updateStore,
);
router.delete("/:storeId", deleteStore);

// Store-specific extra routes
router.get("/:storeId/customer-list", getCustomerList);
router.post("/:storeId/update-settings", updateStoreSettings);
router.post("/:storeId/upload-logo", upload.single("storeLogo"), uploadStoreLogo);
router.post("/:storeId/upload-qr", upload.single("qrCode"), uploadInvoicePaymentQrCode);
router.get("/:storeId/category-list", getCategoriesByStore);
router.post("/:storeId/add-category", createCategory);

// Store access routes
router.get("/:storeId/users", getStoreUsers);
router.post("/:storeId/users", addStoreUser);
router.patch("/:storeId/users/:userId", updateStoreUserRole);
router.delete("/:storeId/users/:userId", removeStoreUser);

export default router;
