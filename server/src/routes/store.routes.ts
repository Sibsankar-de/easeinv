import { Router } from "express";
import {
  createStore,
  getStoreList,
  getStoreDetails,
  updateStore,
  deleteStore,
  updateStoreSettings,
  uploadStoreLogo,
  uploadInvoicePaymentQrCode,
} from "../controllers/store.controller";
import {
  getStoreUsers,
  inviteStoreUser,
  acceptStoreUserInvite,
  updateStoreUserRole,
  removeStoreUser,
  getStoreUserInvite,
} from "../controllers/store-access.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
  verifyOwnerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.post("/create", createStore);
router.get("/list", getStoreList);
router.get("/:storeId", verifyEmployeeLevelAccess, getStoreDetails);
router.patch(
  "/:storeId",
  verifyManagerLevelAccess,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "qrCode", maxCount: 1 },
  ]),
  updateStore,
);
router.delete("/:storeId", verifyOwnerLevelAccess, deleteStore);

// Store-specific extra routes
router.post(
  "/:storeId/update-settings",
  verifyManagerLevelAccess,
  updateStoreSettings,
);
router.post(
  "/:storeId/upload-logo",
  verifyManagerLevelAccess,
  upload.single("storeLogo"),
  uploadStoreLogo,
);
router.post(
  "/:storeId/upload-qr",
  verifyManagerLevelAccess,
  upload.single("qrCode"),
  uploadInvoicePaymentQrCode,
);

// Store access routes
router.get("/:storeId/users", verifyManagerLevelAccess, getStoreUsers);
router.post(
  "/:storeId/users/invite",
  verifyManagerLevelAccess,
  inviteStoreUser,
);
router.get("/user-invite/:token", getStoreUserInvite);
router.post("/user-invite/accept", acceptStoreUserInvite);
router.patch(
  "/:storeId/users/:userId",
  verifyManagerLevelAccess,
  updateStoreUserRole,
);
router.delete(
  "/:storeId/users/:userId",
  verifyManagerLevelAccess,
  removeStoreUser,
);

export default router;
