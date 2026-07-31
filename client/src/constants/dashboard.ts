import {
  ChartNoAxesCombined,
  LayoutGrid,
  Package,
  ReceiptIndianRupee,
  Users,
} from "lucide-react";

export const dashboardChartColors = [
  "var(--primary)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--destructive)",
  "var(--secondary)",
];

export const dashboardChartGridColor = "var(--border)";
export const dashboardChartRevenueColor = "var(--primary)";
export const dashboardChartPaidColor = "var(--chart-2)";
export const dashboardChartDueColor = "var(--destructive)";
export const dashboardChartProfitColor = "var(--chart-4)";
export const dashboardChartVolumeColor = "var(--chart-3)";

export const analyticsLinks = [
  {
    title: "Sales analytics",
    description: "Revenue movement, paid collection, and profit trends.",
    href: "dashboard/sales",
    icon: ChartNoAxesCombined,
    color: "text-primary bg-primary/10",
  },
  {
    title: "Billing analytics",
    description: "Invoices, due payments, and collection health.",
    href: "dashboard/billing",
    icon: ReceiptIndianRupee,
    color: "text-chart-2 bg-chart-2/10",
  },
  {
    title: "Product analytics",
    description: "Top products, category contribution, and units sold.",
    href: "dashboard/products",
    icon: Package,
    color: "text-chart-3 bg-chart-3/10",
  },
  {
    title: "Customer analytics",
    description: "Customer activity, outstanding dues, and repeat billing.",
    href: "dashboard/customers",
    icon: Users,
    color: "text-chart-4 bg-chart-4/10",
  },
  {
    title: "Category analytics",
    description: "Revenue, profit, and units sold by product category.",
    href: "dashboard/categories",
    icon: LayoutGrid,
    color: "text-chart-5 bg-chart-5/10",
  },
];
