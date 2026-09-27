import { ApiKeyScope } from "../enums/apiKey.enum";

export const INVENTORY_READ_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.READ,
  ApiKeyScope.PRODUCT_ALL,
  ApiKeyScope.PRODUCT_READ,
];

export const INVENTORY_WRITE_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.WRITE,
  ApiKeyScope.PRODUCT_ALL,
  ApiKeyScope.PRODUCT_WRITE,
];

export const INVENTORY_DELETE_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.DELETE,
  ApiKeyScope.PRODUCT_ALL,
  ApiKeyScope.PRODUCT_DELETE,
];

export const CATEGORY_READ_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.READ,
  ApiKeyScope.CATEGORY_ALL,
  ApiKeyScope.CATEGORY_READ,
];

export const CATEGORY_WRITE_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.WRITE,
  ApiKeyScope.CATEGORY_ALL,
  ApiKeyScope.CATEGORY_WRITE,
];

export const CATEGORY_DELETE_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.DELETE,
  ApiKeyScope.CATEGORY_ALL,
  ApiKeyScope.CATEGORY_DELETE,
];

export const CUSTOMER_READ_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.READ,
  ApiKeyScope.CUSTOMER_ALL,
  ApiKeyScope.CUSTOMER_READ,
];

export const CUSTOMER_WRITE_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.WRITE,
  ApiKeyScope.CUSTOMER_ALL,
  ApiKeyScope.CUSTOMER_WRITE,
];

export const CUSTOMER_DELETE_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.DELETE,
  ApiKeyScope.CUSTOMER_ALL,
  ApiKeyScope.CUSTOMER_DELETE,
];

export const INVOICE_READ_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.READ,
  ApiKeyScope.INVOICE_ALL,
  ApiKeyScope.INVOICE_READ,
];

export const INVOICE_WRITE_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.WRITE,
  ApiKeyScope.INVOICE_ALL,
  ApiKeyScope.INVOICE_WRITE,
];

export const INVOICE_DELETE_SCOPES: ApiKeyScope[] = [
  ApiKeyScope.ADMIN,
  ApiKeyScope.DELETE,
  ApiKeyScope.INVOICE_ALL,
  ApiKeyScope.INVOICE_DELETE,
];


