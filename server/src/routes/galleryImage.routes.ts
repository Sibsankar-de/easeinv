import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";
import {
  deleteImage,
  getGalleryImages,
  updateImageName,
  uploadGalleryImage,
} from "../controllers/galleryImage.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.use(verifyAuth);

router.post(
  "/:storeId",
  verifyEmployeeLevelAccess,
  upload.single("image"),
  uploadGalleryImage,
);
router.patch("/:storeId/:imageId", verifyEmployeeLevelAccess, updateImageName);
router.delete("/:storeId/:imageId", verifyManagerLevelAccess, deleteImage);
router.get("/:storeId", verifyEmployeeLevelAccess, getGalleryImages);

export default router;
