import { Router } from "express";
import { searchProducts } from "../controllers/product.controller";
import { searchCustomers } from "../controllers/customer.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyStoreAccess } from "../middlewares/verifyStoreAccess.middleware";
import { EmployeeLevelRoles } from "../constants/userStoreRoles";

const router = Router();

router.use(verifyAuth);

router.get(
  "/:storeId/products",
  verifyStoreAccess(EmployeeLevelRoles),
  searchProducts,
);

router.get(
  "/:storeId/customers",
  verifyStoreAccess(EmployeeLevelRoles),
  searchCustomers,
);

export default router;
