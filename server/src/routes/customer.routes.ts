import { Router } from "express";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyStoreAccess } from "../middlewares/verifyStoreAccess.middleware";
import {
  EmployeeLevelRoles,
  ManagerLevelRoles,
} from "../constants/userStoreRoles";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyStoreAccess(EmployeeLevelRoles), getCustomers);
router.post("/:storeId", verifyStoreAccess(EmployeeLevelRoles), createCustomer);
router.patch(
  "/:storeId/:customerId",
  verifyStoreAccess(EmployeeLevelRoles),
  updateCustomer,
);
router.delete(
  "/:storeId/:customerId",
  verifyStoreAccess(ManagerLevelRoles),
  deleteCustomer,
);

export default router;
