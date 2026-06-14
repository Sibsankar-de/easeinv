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

router.post("/:storeId", verifyOwnerLevelAccess, createApiKey);
router.patch("/rename/:storeId/:keyId", verifyOwnerLevelAccess, renameApiKey);
router.patch("/revoke/:storeId/:keyId", verifyOwnerLevelAccess, revokeApiKey);
router.get("/:storeId", verifyOwnerLevelAccess, getAllApiKeys);

export default router;
