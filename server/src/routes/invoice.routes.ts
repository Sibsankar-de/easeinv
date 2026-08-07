import { Router } from "express";
import {
  searchInvoice,
  createInvoice,
  updateInvoiceDueAmount,
  getInvoiceSummary,
  getInvoiceById,
  exportInvoices,
} from "../controllers/invoice.controller";
import { verifyAuth } from "../middlewares/auth.middleware";
import { verifyEmployeeLevelAccess } from "../middlewares/verifyStoreAccess.middleware";

const router = Router();

router.use(verifyAuth);

router.get("/:storeId", verifyEmployeeLevelAccess, searchInvoice);
router.get("/:storeId/export", verifyEmployeeLevelAccess, exportInvoices);
router.post("/:storeId", verifyEmployeeLevelAccess, createInvoice);

router.get("/:storeId/summary", verifyEmployeeLevelAccess, getInvoiceSummary);
router.patch(
  "/:storeId/:invoiceId",
  verifyEmployeeLevelAccess,
  updateInvoiceDueAmount,
);
router
  .route("/:storeId/:invoiceId")
  .get(verifyEmployeeLevelAccess, getInvoiceById);

export default router;
