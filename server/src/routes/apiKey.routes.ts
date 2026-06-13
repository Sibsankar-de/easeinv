import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyOwnerLevelAccess } from "../middlewares/verifyStoreAccess.middleware";
import {
  createApiKey,
  getAllApiKeys,
  renameApiKey,
  revokeApiKey,
} from "../controllers/apiKey.controller";

const router = Router();

router.use(verifyAuth);
router.use(verifyOwnerLevelAccess);

router.post("/", createApiKey);
router.patch("/rename/:keyId", renameApiKey);
router.patch("/revoke/:keyId", revokeApiKey);
router.get("/", getAllApiKeys);

export default router;
