import { Router } from "express";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "../controllers/customer.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyEmployeeLevelAccess, getCustomers);
router.post("/:storeId", verifyEmployeeLevelAccess, createCustomer);
router.get("/:storeId/:customerId", verifyEmployeeLevelAccess, getCustomerById);
router.patch(
  "/:storeId/:customerId",
  verifyEmployeeLevelAccess,
  updateCustomer,
);
router.delete(
  "/:storeId/:customerId",
  verifyManagerLevelAccess,
  deleteCustomer,
);

export default router;
