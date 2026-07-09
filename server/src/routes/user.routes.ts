import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUser,
  updatePassword,
  updateAvatar,
  checkAuth,
} from "../controllers/user.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route("/register").post(createUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyAuth, logoutUser);
router.route("/current-user").get(verifyAuth, getCurrentUser);
router.route("/update-user").patch(verifyAuth, updateUser);
router.route("/update-password").patch(verifyAuth, updatePassword);
router
  .route("/update-avatar")
  .patch(verifyAuth, upload.single("avatar"), updateAvatar);
router.route("/check-auth").get(verifyAuth, checkAuth);

export default router;
