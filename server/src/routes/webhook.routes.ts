import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  createWebhook,
  listWebhooks,
  deleteWebhook,
} from "../controllers/webhook.controller";

const router = Router();

router.use(verifyAuth);

router.post("/", createWebhook);
router.get("/", listWebhooks);
router.delete("/:id", deleteWebhook);

export default router;
