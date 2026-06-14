export const apiKeyStatus = {
  ACTIVE: "ACTIVE",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED",
};

export const invoiceScope = {
  INVOICE_READ: "invoice:read",
  INVOICE_WRITE: "invoice:write",
  INVOICE_DELETE: "invoice:delete",
};

export const productScope = {
  PRODUCT_READ: "product:read",
  PRODUCT_WRITE: "product:write",
  PRODUCT_DELETE: "product:delete",
};

export const customerScope = {
  CUSTOMER_READ: "customer:read",
  CUSTOMER_WRITE: "customer:write",
  CUSTOMER_DELETE: "customer:delete",
};

export const apiKeyScope = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  ADMIN: "admin",
  INVOICE_ALL: "invoice:all",
  PRODUCT_ALL: "product:all",
  CUSTOMER_ALL: "customer:all",
  ...invoiceScope,
  ...productScope,
  ...customerScope,
};

export type ApiKeyScope = (typeof apiKeyScope)[keyof typeof apiKeyScope];
export const apiKeyScopeList = Object.values(apiKeyScope);
