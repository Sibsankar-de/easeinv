import { Router } from "express";
import {
  getCustomers,

  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  exportCustomers,
} from "../controllers/customer.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyEmployeeLevelAccess, getCustomers);
router.get("/:storeId/export", verifyEmployeeLevelAccess, exportCustomers);
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
