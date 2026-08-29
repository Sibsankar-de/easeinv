/**
 * API Explorer — endpoint definitions.
 * Derived from the real server routes/controllers/schemas.
 * No mock data — only structure, params, scopes, and example bodies.
 */

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
export type ApiCollection =
  | "products"
  | "categories"
  | "customers"
  | "invoices"
  | "orders";

export interface ApiParam {
  name: string;
  type: "string" | "integer" | "boolean" | "number";
  required: boolean;
  desc: string;
  in: "query" | "path";
}

export interface ApiBodyField {
  name: string;
  type: string;
  required: boolean;
  desc: string;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  /** Full server path e.g. /api/v1/products/:productId */
  path: string;
  name: string;
  description: string;
  collection: ApiCollection;
  /** Required API key scopes */
  scopes: string[];
  params?: ApiParam[];
  bodyFields?: ApiBodyField[];
  /** Default body object shown in the playground (for POST/PATCH) */
  defaultBody?: object;
}

// ---------------------------------------------------------------------------
// Scope constants (mirrors server/src/constants/apiKeyScopes.constant.ts)
// ---------------------------------------------------------------------------
const PRODUCT_READ_SCOPES = ["admin", "read", "product:all", "product:read"];
const PRODUCT_WRITE_SCOPES = ["admin", "write", "product:all", "product:write"];
const PRODUCT_DELETE_SCOPES = [
  "admin",
  "delete",
  "product:all",
  "product:delete",
];

const CATEGORY_READ_SCOPES = ["admin", "read", "category:all", "category:read"];
const CATEGORY_WRITE_SCOPES = [
  "admin",
  "write",
  "category:all",
  "category:write",
];
const CATEGORY_DELETE_SCOPES = [
  "admin",
  "delete",
  "category:all",
  "category:delete",
];

const CUSTOMER_READ_SCOPES = ["admin", "read", "customer:all", "customer:read"];
const CUSTOMER_WRITE_SCOPES = [
  "admin",
  "write",
  "customer:all",
  "customer:write",
];
const CUSTOMER_DELETE_SCOPES = [
  "admin",
  "delete",
  "customer:all",
  "customer:delete",
];

const INVOICE_READ_SCOPES = ["admin", "read", "invoice:all", "invoice:read"];
const INVOICE_WRITE_SCOPES = ["admin", "write", "invoice:all", "invoice:write"];

const ORDER_READ_SCOPES = ["admin", "read", "order:all", "order:read"];
const ORDER_CREATE_SCOPES = ["admin", "write", "order:all", "order:create"];
const ORDER_WRITE_SCOPES = ["admin", "write", "order:all", "order:write"];
const ORDER_DELETE_SCOPES = ["admin", "delete", "order:all", "order:delete"];

// Endpoint definitions
export const API_ENDPOINTS: ApiEndpoint[] = [
  // Products
  {
    id: "list-products",
    method: "GET",
    path: "/api/v1/products",
    name: "List Products",
    description:
      "Retrieve a paginated list of products in your store's inventory. Supports pagination, sorting, and optional filtering by category.",
    collection: "products",
    scopes: PRODUCT_READ_SCOPES,
    params: [
      {
        name: "page",
        type: "integer",
        required: false,
        desc: "Page number (default: 1).",
        in: "query",
      },
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Items per page (default: 20).",
        in: "query",
      },
      {
        name: "query",
        type: "string",
        required: false,
        desc: "Search query to filter products by name or SKU.",
        in: "query",
      },
      {
        name: "sortBy",
        type: "string",
        required: false,
        desc: "Field to sort by (default: createdAt).",
        in: "query",
      },
      {
        name: "sortOrder",
        type: "string",
        required: false,
        desc: "Sort direction: asc or desc.",
        in: "query",
      },
      {
        name: "categoryId",
        type: "string",
        required: false,
        desc: "Filter products by category ID.",
        in: "query",
      },
    ],
  },
  {
    id: "get-product",
    method: "GET",
    path: "/api/v1/products/:productId",
    name: "Get Product",
    description: "Retrieve full details of a single product by its ID.",
    collection: "products",
    scopes: PRODUCT_READ_SCOPES,
    params: [
      {
        name: "productId",
        type: "string",
        required: true,
        desc: "The unique ID of the product.",
        in: "path",
      },
    ],
  },
  {
    id: "create-product",
    method: "POST",
    path: "/api/v1/products",
    name: "Create Product",
    description: "Add a new product to your store's inventory catalog.",
    collection: "products",
    scopes: PRODUCT_WRITE_SCOPES,
    bodyFields: [
      {
        name: "storeId",
        type: "string",
        required: true,
        desc: "Your store ID.",
      },
      { name: "name", type: "string", required: true, desc: "Product name." },
      {
        name: "sku",
        type: "string",
        required: true,
        desc: "Stock Keeping Unit identifier.",
      },
      {
        name: "stockUnit",
        type: "string",
        required: true,
        desc: "Unit of measure (e.g. pcs, kg, L).",
      },
      {
        name: "buyingPricePerQuantity",
        type: "number",
        required: true,
        desc: "Cost price per unit.",
      },
      {
        name: "pricePerQuantity",
        type: "array",
        required: true,
        desc: "Selling price tiers array.",
      },
      {
        name: "trackInventory",
        type: "boolean",
        required: false,
        desc: "Enable stock tracking.",
      },
      {
        name: "totalStock",
        type: "number",
        required: false,
        desc: "Initial stock count (required if trackInventory=true).",
      },
      {
        name: "description",
        type: "string",
        required: false,
        desc: "Product description.",
      },
      {
        name: "mrp",
        type: "number",
        required: false,
        desc: "Maximum retail price.",
      },
      {
        name: "categoryIds",
        type: "array",
        required: false,
        desc: "Array of category UUIDs.",
      },
    ],
    defaultBody: {
      storeId: "YOUR_STORE_ID",
      name: "Sample Product",
      sku: "PROD-001",
      stockUnit: "pcs",
      buyingPricePerQuantity: 50,
      pricePerQuantity: [
        { id: 1, price: 99.99, quantity: 1, unit: "pcs", profitMargin: 0 },
      ],
      trackInventory: true,
      totalStock: 100,
    },
  },
  {
    id: "update-product",
    method: "PATCH",
    path: "/api/v1/products/:productId",
    name: "Update Product",
    description:
      "Update an existing product's details. All fields from Create Product are accepted.",
    collection: "products",
    scopes: PRODUCT_WRITE_SCOPES,
    params: [
      {
        name: "productId",
        type: "string",
        required: true,
        desc: "The unique ID of the product to update.",
        in: "path",
      },
    ],
    bodyFields: [
      {
        name: "name",
        type: "string",
        required: false,
        desc: "New product name.",
      },
      { name: "sku", type: "string", required: false, desc: "New SKU." },
      {
        name: "buyingPricePerQuantity",
        type: "number",
        required: false,
        desc: "New cost price.",
      },
      {
        name: "totalStock",
        type: "number",
        required: false,
        desc: "Updated stock quantity.",
      },
    ],
    defaultBody: {
      storeId: "YOUR_STORE_ID",
      name: "Updated Product Name",
      sku: "PROD-001-V2",
      stockUnit: "pcs",
      buyingPricePerQuantity: 55,
      pricePerQuantity: [
        { id: 1, price: 109.99, quantity: 1, unit: "pcs", profitMargin: 0 },
      ],
    },
  },
  {
    id: "delete-product",
    method: "DELETE",
    path: "/api/v1/products/:productId",
    name: "Delete Product",
    description: "Permanently delete a product from your store's inventory.",
    collection: "products",
    scopes: PRODUCT_DELETE_SCOPES,
    params: [
      {
        name: "productId",
        type: "string",
        required: true,
        desc: "The unique ID of the product to delete.",
        in: "path",
      },
    ],
  },
  {
    id: "search-products",
    method: "GET",
    path: "/api/v1/inventory/products/search",
    name: "Search Products",
    description:
      "Full-text search across your store's products by name or SKU.",
    collection: "products",
    scopes: PRODUCT_READ_SCOPES,
    params: [
      {
        name: "query",
        type: "string",
        required: false,
        desc: "Search term to match against product name and SKU.",
        in: "query",
      },
    ],
  },

  // Categories
  {
    id: "list-categories",
    method: "GET",
    path: "/api/v1/inventory/categories",
    name: "List Categories",
    description: "Retrieve all product categories for your store.",
    collection: "categories",
    scopes: CATEGORY_READ_SCOPES,
  },
  {
    id: "create-category",
    method: "POST",
    path: "/api/v1/inventory/categories",
    name: "Create Category",
    description: "Create a new product category.",
    collection: "categories",
    scopes: CATEGORY_WRITE_SCOPES,
    bodyFields: [
      { name: "name", type: "string", required: true, desc: "Category name." },
    ],
    defaultBody: { name: "Electronics" },
  },
  {
    id: "update-category",
    method: "PATCH",
    path: "/api/v1/inventory/categories/:categoryId",
    name: "Update Category",
    description: "Rename an existing product category.",
    collection: "categories",
    scopes: CATEGORY_WRITE_SCOPES,
    params: [
      {
        name: "categoryId",
        type: "string",
        required: true,
        desc: "The unique ID of the category to update.",
        in: "path",
      },
    ],
    bodyFields: [
      {
        name: "name",
        type: "string",
        required: true,
        desc: "New category name.",
      },
    ],
    defaultBody: { name: "Updated Category Name" },
  },
  {
    id: "delete-category",
    method: "DELETE",
    path: "/api/v1/inventory/categories/:categoryId",
    name: "Delete Category",
    description:
      "Delete a product category. Products in this category will be uncategorized.",
    collection: "categories",
    scopes: CATEGORY_DELETE_SCOPES,
    params: [
      {
        name: "categoryId",
        type: "string",
        required: true,
        desc: "The unique ID of the category to delete.",
        in: "path",
      },
    ],
  },

  // Customers
  {
    id: "list-customers",
    method: "GET",
    path: "/api/v1/customers",
    name: "List Customers",
    description:
      "Retrieve a paginated list of customers for your store with billing statistics.",
    collection: "customers",
    scopes: CUSTOMER_READ_SCOPES,
    params: [
      {
        name: "page",
        type: "integer",
        required: false,
        desc: "Page number (default: 1).",
        in: "query",
      },
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Items per page (default: 10).",
        in: "query",
      },
      {
        name: "sortBy",
        type: "string",
        required: false,
        desc: "Field to sort by (default: createdAt).",
        in: "query",
      },
      {
        name: "sortOrder",
        type: "string",
        required: false,
        desc: "Sort direction: asc or desc.",
        in: "query",
      },
    ],
  },
  {
    id: "get-customer",
    method: "GET",
    path: "/api/v1/customers/:customerId",
    name: "Get Customer",
    description:
      "Retrieve full profile details of a customer including billing and due history.",
    collection: "customers",
    scopes: CUSTOMER_READ_SCOPES,
    params: [
      {
        name: "customerId",
        type: "string",
        required: true,
        desc: "The unique ID of the customer.",
        in: "path",
      },
    ],
  },
  {
    id: "create-customer",
    method: "POST",
    path: "/api/v1/customers",
    name: "Create Customer",
    description:
      "Create a new customer profile for tracking billing and transactions.",
    collection: "customers",
    scopes: CUSTOMER_WRITE_SCOPES,
    bodyFields: [
      {
        name: "name",
        type: "string",
        required: true,
        desc: "Customer's full name.",
      },
      {
        name: "phoneNumber",
        type: "string",
        required: false,
        desc: "Customer phone number.",
      },
      {
        name: "email",
        type: "string",
        required: false,
        desc: "Customer email address.",
      },
      {
        name: "address",
        type: "string",
        required: false,
        desc: "Customer address.",
      },
    ],
    defaultBody: {
      name: "Jane Doe",
      phoneNumber: "+91 9876543210",
      email: "jane@example.com",
      address: "123 Main St, City",
    },
  },
  {
    id: "update-customer",
    method: "PATCH",
    path: "/api/v1/customers/:customerId",
    name: "Update Customer",
    description: "Update an existing customer's profile information.",
    collection: "customers",
    scopes: CUSTOMER_WRITE_SCOPES,
    params: [
      {
        name: "customerId",
        type: "string",
        required: true,
        desc: "The unique ID of the customer to update.",
        in: "path",
      },
    ],
    bodyFields: [
      {
        name: "name",
        type: "string",
        required: false,
        desc: "Customer's name.",
      },
      {
        name: "phoneNumber",
        type: "string",
        required: false,
        desc: "Customer phone number.",
      },
      {
        name: "email",
        type: "string",
        required: false,
        desc: "Customer email address.",
      },
      {
        name: "address",
        type: "string",
        required: false,
        desc: "Customer address.",
      },
    ],
    defaultBody: {
      name: "Jane Doe Updated",
      phoneNumber: "+91 9876543210",
    },
  },
  {
    id: "delete-customer",
    method: "DELETE",
    path: "/api/v1/customers/:customerId",
    name: "Delete Customer",
    description: "Delete a customer profile from your store.",
    collection: "customers",
    scopes: CUSTOMER_DELETE_SCOPES,
    params: [
      {
        name: "customerId",
        type: "string",
        required: true,
        desc: "The unique ID of the customer to delete.",
        in: "path",
      },
    ],
  },

  // Invoices
  {
    id: "get-invoice",
    method: "GET",
    path: "/api/v1/invoices/:invoiceId",
    name: "Get Invoice",
    description:
      "Retrieve a billing invoice by its ID including all line items and customer details.",
    collection: "invoices",
    scopes: INVOICE_READ_SCOPES,
    params: [
      {
        name: "invoiceId",
        type: "string",
        required: true,
        desc: "The unique ID of the invoice.",
        in: "path",
      },
    ],
  },
  {
    id: "create-invoice",
    method: "POST",
    path: "/api/v1/invoices",
    name: "Create Invoice",
    description:
      "Generate a new billing invoice for a customer. Supports multiple line items, tax rates, discounts, and status.",
    collection: "invoices",
    scopes: INVOICE_WRITE_SCOPES,
    bodyFields: [
      {
        name: "invoiceNumber",
        type: "string",
        required: true,
        desc: "Unique invoice identifier string.",
      },
      {
        name: "issueDate",
        type: "string",
        required: true,
        desc: "Invoice date (ISO 8601 string or Date).",
      },
      {
        name: "paidAmount",
        type: "number",
        required: true,
        desc: "Amount already paid.",
      },
      {
        name: "billItems",
        type: "array",
        required: true,
        desc: "Array of line items (productId, netQuantity, totalPrice, stockUnit).",
      },
      {
        name: "customer",
        type: "object",
        required: true,
        desc: "Customer object with name, and optional phoneNumber, email, address.",
      },
      {
        name: "taxRate",
        type: "number",
        required: false,
        desc: "Tax rate percentage (default: 0).",
      },
      {
        name: "discountPercent",
        type: "number",
        required: false,
        desc: "Discount percentage.",
      },
      {
        name: "roundupTotal",
        type: "boolean",
        required: false,
        desc: "Whether to round up the total.",
      },
      {
        name: "note",
        type: "string",
        required: false,
        desc: "Optional note on the invoice.",
      },
      {
        name: "status",
        type: "string",
        required: false,
        desc: "Invoice status: DRAFTED or ISSUED (default: DRAFTED).",
      },
    ],
    defaultBody: {
      invoiceNumber: "INV-2026-001",
      issueDate: new Date().toISOString(),
      paidAmount: 0,
      taxRate: 0,
      status: "DRAFTED",
      customer: {
        name: "Jane Doe",
        phoneNumber: "+91 9876543210",
      },
      billItems: [
        {
          productId: "YOUR_PRODUCT_ID",
          netQuantity: 2,
          totalPrice: 199.98,
          stockUnit: "pcs",
        },
      ],
    },
  },

  // Orders
  {
    id: "list-orders",
    method: "GET",
    path: "/api/v1/orders",
    name: "List Orders",
    description:
      "Retrieve a paginated list of customer orders with optional status, search query, and customer filtering.",
    collection: "orders",
    scopes: ORDER_READ_SCOPES,
    params: [
      {
        name: "page",
        type: "integer",
        required: false,
        desc: "Page number (default: 1).",
        in: "query",
      },
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Items per page (default: 10).",
        in: "query",
      },
      {
        name: "query",
        type: "string",
        required: false,
        desc: "Search query to filter by order number or customer name.",
        in: "query",
      },
      {
        name: "status",
        type: "string",
        required: false,
        desc: "Filter by status: PENDING, PROCESSING, DISPATCHED, COMPLETED, or REJECTED.",
        in: "query",
      },
      {
        name: "customerId",
        type: "string",
        required: false,
        desc: "Filter orders for a specific customer ID.",
        in: "query",
      },
      {
        name: "sortBy",
        type: "string",
        required: false,
        desc: "Field to sort by (e.g. createdAt, totalAmount).",
        in: "query",
      },
      {
        name: "sortOrder",
        type: "string",
        required: false,
        desc: "Sort order: asc or desc.",
        in: "query",
      },
    ],
  },
  {
    id: "get-order",
    method: "GET",
    path: "/api/v1/orders/:orderId",
    name: "Get Order",
    description:
      "Retrieve full details of a specific order including linked customer, draft/issued invoice, bill items, and shipping metadata.",
    collection: "orders",
    scopes: ORDER_READ_SCOPES,
    params: [
      {
        name: "orderId",
        type: "string",
        required: true,
        desc: "The unique ID of the order.",
        in: "path",
      },
    ],
  },
  {
    id: "create-order",
    method: "POST",
    path: "/api/v1/orders",
    name: "Create Order",
    description:
      "Place a new order for an existing customer with product line items. Total prices are calculated server-side, and an automatic draft invoice is created.",
    collection: "orders",
    scopes: ORDER_CREATE_SCOPES,
    bodyFields: [
      {
        name: "customerId",
        type: "string",
        required: true,
        desc: "Valid customer UUID registered in the store.",
      },
      {
        name: "invoiceData",
        type: "object",
        required: true,
        desc: "Invoice payload with billItems array containing productId, netQuantity, and optional stockUnit.",
      },
      {
        name: "couponCode",
        type: "string",
        required: false,
        desc: "Optional promotional coupon code to apply discount.",
      },
      {
        name: "shippingAmount",
        type: "number",
        required: false,
        desc: "Delivery or shipping charges.",
      },
      {
        name: "note",
        type: "string",
        required: false,
        desc: "Customer delivery note or instructions.",
      },
      {
        name: "extraData",
        type: "object",
        required: false,
        desc: "Optional custom key-value metadata.",
      },
    ],
    defaultBody: {
      customerId: "YOUR_CUSTOMER_UUID",
      couponCode: "WELCOME10",
      shippingAmount: 50,
      note: "Please deliver between 10am and 4pm",
      invoiceData: {
        billItems: [
          {
            productId: "YOUR_PRODUCT_UUID",
            netQuantity: 2,
            stockUnit: "pcs",
          },
        ],
      },
    },
  },
  {
    id: "update-order-status",
    method: "PATCH",
    path: "/api/v1/orders/:orderId/status",
    name: "Update Order Status",
    description:
      "Transition order lifecycle status (PROCESSING, DISPATCHED, COMPLETED, or REJECTED). Completing an order automatically issues the invoice and decrements stock.",
    collection: "orders",
    scopes: ORDER_WRITE_SCOPES,
    params: [
      {
        name: "orderId",
        type: "string",
        required: true,
        desc: "The unique ID of the order.",
        in: "path",
      },
    ],
    bodyFields: [
      {
        name: "status",
        type: "string",
        required: true,
        desc: "Target status: PROCESSING, DISPATCHED, COMPLETED, or REJECTED.",
      },
      {
        name: "deliveryReference",
        type: "string",
        required: false,
        desc: "Tracking / consignment number (required when status is DISPATCHED).",
      },
      {
        name: "note",
        type: "string",
        required: false,
        desc: "Delivery notes or customer instructions.",
      },
      {
        name: "reason",
        type: "string",
        required: false,
        desc: "Cancellation / rejection reason (when status is REJECTED).",
      },
    ],
    defaultBody: {
      status: "DISPATCHED",
      deliveryReference: "TRK-987654321",
      note: "Dispatched via Express Courier",
    },
  },
  {
    id: "delete-order",
    method: "DELETE",
    path: "/api/v1/orders/:orderId",
    name: "Delete Order",
    description:
      "Permanently delete a pending or cancelled order and its linked draft invoice.",
    collection: "orders",
    scopes: ORDER_DELETE_SCOPES,
    params: [
      {
        name: "orderId",
        type: "string",
        required: true,
        desc: "The unique ID of the order.",
        in: "path",
      },
    ],
  },
];

export const ENDPOINT_COLLECTIONS: {
  key: ApiCollection;
  title: string;
}[] = [
  { key: "products", title: "Products" },
  { key: "categories", title: "Categories" },
  { key: "customers", title: "Customers" },
  { key: "invoices", title: "Invoices" },
  { key: "orders", title: "Orders" },
];
