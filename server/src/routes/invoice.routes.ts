import { Router } from "express";
import {
  searchInvoice,
  createInvoice,
  updateInvoiceDueAmount,
  getInvoiceSummary,
} from "../controllers/invoice.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyStoreAccess } from "../middlewares/verifyStoreAccess.middleware";
import {
  EmployeeLevelRoles,
  ManagerLevelRoles,
} from "../constants/userStoreRoles";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyStoreAccess(EmployeeLevelRoles), searchInvoice);
router.post("/:storeId", verifyStoreAccess(EmployeeLevelRoles), createInvoice);
router.get(
  "/:storeId/summary",
  verifyStoreAccess(EmployeeLevelRoles),
  getInvoiceSummary,
);
router.patch(
  "/:storeId/:invoiceId",
  verifyStoreAccess(ManagerLevelRoles),
  updateInvoiceDueAmount,
);

export default router;
