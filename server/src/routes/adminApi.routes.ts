import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/verifyAdmin.middleware";
import {
  reindexProducts,
  reindexCustomers,
} from "../controllers/adminApi.controller";

const router = Router();

router.use(verifyAuth, verifyAdmin);

router.post("/es/reindex/products", reindexProducts);
router.post("/es/reindex/customers", reindexCustomers);

export default router;
