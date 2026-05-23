import { Router } from "express";
import {
  searchInvoice,
  createInvoice,
  updateInvoiceDueAmount,
  getInvoiceSummary,
} from "../controllers/invoice.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  verifyEmployeeLevelAccess,
  verifyManagerLevelAccess,
} from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyEmployeeLevelAccess, searchInvoice);
router.post("/:storeId", verifyEmployeeLevelAccess, createInvoice);
router.get("/:storeId/summary", verifyEmployeeLevelAccess, getInvoiceSummary);
router.patch(
  "/:storeId/:invoiceId",
  verifyManagerLevelAccess,
  updateInvoiceDueAmount,
);

export default router;
