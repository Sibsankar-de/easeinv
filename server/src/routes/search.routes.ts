import { Router } from "express";
import { searchProducts } from "../controllers/product.controller";
import { searchCustomers } from "../controllers/customer.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyEmployeeLevelAccess } from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId/products", verifyEmployeeLevelAccess, searchProducts);

router.get("/:storeId/customers", verifyEmployeeLevelAccess, searchCustomers);

export default router;
