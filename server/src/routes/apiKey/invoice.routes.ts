import { Router } from "express";
import {
  getInvoiceById,
  createInvoice,
} from "../../controllers/apiKey/invoice.controller";
import { verifyApiKeyScope } from "../../middlewares/verifyApiKey.middleware";
import {
  INVOICE_READ_SCOPES,
  INVOICE_WRITE_SCOPES,
} from "../../constants/apiKeyScopes.constant";

const router = Router();

// Single invoice by ID
router.get(
  "/:invoiceId",
  verifyApiKeyScope(INVOICE_READ_SCOPES),
  getInvoiceById,
);

// Create invoice
router.post("/", verifyApiKeyScope(INVOICE_WRITE_SCOPES), createInvoice);

export default router;

