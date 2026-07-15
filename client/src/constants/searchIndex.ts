export interface SearchIndexItem {
  id: string;
  title: string;
  description: string;
  path: string;
  keywords: string[];
  isStorePage: boolean;
}

export const searchIndex: SearchIndexItem[] = [
  // Global Pages
  {
    id: "stores",
    title: "All Stores",
    description: "View and manage all your available stores.",
    path: "/stores",
    keywords: ["stores", "list", "management", "switch"],
    isStorePage: false,
  },
  {
    id: "profile",
    title: "User Profile",
    description: "Manage your account details and personal information.",
    path: "/profile",
    keywords: ["profile", "user", "account", "settings", "me"],
    isStorePage: false,
  },

  // Store Pages
  {
    id: "store-dashboard",
    title: "Store Dashboard",
    description: "Overview of your store's performance and key metrics.",
    path: "dashboard",
    keywords: ["dashboard", "overview", "home", "stats", "analytics"],
    isStorePage: true,
  },
  {
    id: "sales-analytics",
    title: "Sales Analytics",
    description: "Detailed analysis of sales trends, revenue, and profit.",
    path: "dashboard/sales",
    keywords: ["sales", "revenue", "profit", "trends", "analytics"],
    isStorePage: true,
  },
  {
    id: "billing-analytics",
    title: "Billing Analytics",
    description: "Insights into invoices, due payments, and collection health.",
    path: "dashboard/billing",
    keywords: ["billing", "invoices", "dues", "payments", "analytics"],
    isStorePage: true,
  },
  {
    id: "product-analytics",
    title: "Product Analytics",
    description: "Top products, category contribution, and inventory insights.",
    path: "dashboard/products",
    keywords: ["products", "categories", "units", "sales", "analytics"],
    isStorePage: true,
  },
  {
    id: "customer-analytics",
    title: "Customer Analytics",
    description:
      "Customer activity, outstanding dues, and repeat billing behavior.",
    path: "dashboard/customers",
    keywords: ["customers", "activity", "dues", "retention", "analytics"],
    isStorePage: true,
  },
  {
    id: "create-invoice",
    title: "Create Invoice",
    description: "Generate a new professional invoice for a customer.",
    path: "billing",
    keywords: ["create", "invoice", "new", "bill", "billing"],
    isStorePage: true,
  },
  {
    id: "invoices-list",
    title: "Invoices List",
    description: "View, manage, and track all your store's invoices.",
    path: "invoices",
    keywords: ["invoices", "list", "manage", "history", "records"],
    isStorePage: true,
  },
  {
    id: "customers-list",
    title: "Customers",
    description: "Manage your store's customers and their billing details.",
    path: "customers",
    keywords: ["customers", "list", "clients", "contacts", "manage"],
    isStorePage: true,
  },
  {
    id: "inventory-list",
    title: "Inventory",
    description: "View and manage your store's products and categories.",
    path: "inventory",
    keywords: ["inventory", "products", "stock", "items", "catalog"],
    isStorePage: true,
  },
  {
    id: "add-product",
    title: "Add Product",
    description: "Add a new product to your store's inventory.",
    path: "inventory/add-product",
    keywords: ["add", "new", "product", "item", "inventory"],
    isStorePage: true,
  },
  {
    id: "store-settings",
    title: "Store Settings",
    description: "General store configuration and information.",
    path: "settings",
    keywords: ["settings", "general", "store", "configuration", "details"],
    isStorePage: true,
  },
  {
    id: "invoice-settings",
    title: "Invoice Settings",
    description:
      "Customize your invoice branding, prefix, and payment details.",
    path: "settings/invoice",
    keywords: ["settings", "invoice", "branding", "prefix", "qr", "bank"],
    isStorePage: true,
  },
  {
    id: "inventory-settings",
    title: "Inventory Settings",
    description: "Configure stock tracking and custom product units.",
    path: "settings/inventory",
    keywords: ["settings", "inventory", "stock", "tracking", "units"],
    isStorePage: true,
  },
];
