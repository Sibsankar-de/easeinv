import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyOwnerLevelAccess } from "../middlewares/verifyStoreAccess.middleware";
import {
  createApiKey,
  getAllApiKeys,
  updateApiKey,
  removeApiKey,
} from "../controllers/apiKey.controller";

const router = Router();

router.use(verifyAuth);

router.post("/:storeId", verifyOwnerLevelAccess, createApiKey);
router.patch("/rename/:storeId/:keyId", verifyOwnerLevelAccess, updateApiKey);
router.delete("/:storeId/:keyId", verifyOwnerLevelAccess, removeApiKey);
router.get("/:storeId", verifyOwnerLevelAccess, getAllApiKeys);

export default router;
