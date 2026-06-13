export const apiKeyStatus = {
  ACTIVE: "ACTIVE",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED",
};

export const apiKeyStatusList = Object.values(apiKeyStatus);

export const apiKeyScope = {
  READ: "read",
  INVOICE_READ: "invoice:read",
  INVOICE_WRITE: "invoice:write",
  INVOICE_DELETE: "invoice:delete",
  PRODUCT_READ: "product:read",
  PRODUCT_WRITE: "product:write",
  PRODUCT_DELETE: "product:delete",
  CUSTOMER_READ: "customer:read",
  CUSTOMER_WRITE: "customer:write",
  CUSTOMER_DELETE: "customer:delete",
  WRITE: "write",
  DELETE: "delete",
  ADMIN: "admin",
};

export type ApiKeyScope = (typeof apiKeyScope)[keyof typeof apiKeyScope];

export const apiKeyScopeList = Object.values(apiKeyScope);
