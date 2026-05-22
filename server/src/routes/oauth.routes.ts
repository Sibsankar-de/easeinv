import { Router } from "express";
import {
  googleAuth,
  googleAuthCallback,
} from "../controllers/oauth.controller";

const router = Router();

router.get("/authenticate", googleAuth);
router.get("/callback/google", googleAuthCallback);

export default router;
