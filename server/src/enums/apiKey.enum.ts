export enum ApiKeyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
}

export const apiKeyStatusList = Object.values(ApiKeyStatus) as [
  string,
  ...string[],
];

export enum ApiKeyScope {
  READ = "read",
  INVOICE_ALL = "invoice:all",
  INVOICE_READ = "invoice:read",
  INVOICE_WRITE = "invoice:write",
  INVOICE_DELETE = "invoice:delete",
  PRODUCT_ALL = "product:all",
  PRODUCT_READ = "product:read",
  PRODUCT_WRITE = "product:write",
  PRODUCT_DELETE = "product:delete",
  CUSTOMER_ALL = "customer:all",
  CUSTOMER_READ = "customer:read",
  CUSTOMER_WRITE = "customer:write",
  CUSTOMER_DELETE = "customer:delete",
  WRITE = "write",
  DELETE = "delete",
  ADMIN = "admin",
}

export const apiKeyScopeList = Object.values(ApiKeyScope) as [
  string,
  ...string[],
];
