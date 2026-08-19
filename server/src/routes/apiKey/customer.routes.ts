import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../controllers/apiKey/customer.controller";
import { verifyApiKeyScope } from "../../middlewares/verifyApiKey.middleware";
import {
  CUSTOMER_READ_SCOPES,
  CUSTOMER_WRITE_SCOPES,
  CUSTOMER_DELETE_SCOPES,
} from "../../constants/apiKeyScopes.constant";

const router = Router();

// Single customer by ID
router.get(
  "/:customerId",
  verifyApiKeyScope(CUSTOMER_READ_SCOPES),
  getCustomerById,
);
router.patch(
  "/:customerId",
  verifyApiKeyScope(CUSTOMER_WRITE_SCOPES),
  updateCustomer,
);
router.delete(
  "/:customerId",
  verifyApiKeyScope(CUSTOMER_DELETE_SCOPES),
  deleteCustomer,
);

// List & Create
router.get("/", verifyApiKeyScope(CUSTOMER_READ_SCOPES), getCustomers);
router.post("/", verifyApiKeyScope(CUSTOMER_WRITE_SCOPES), createCustomer);

export default router;
