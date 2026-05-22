import { AnalyticsPeriod } from "@/types/DashboardAnalyticsType";
import {
  ChartNoAxesCombined,
  Package,
  ReceiptIndianRupee,
  Users,
} from "lucide-react";

export const analyticsPeriodOptions: {
  label: string;
  value: AnalyticsPeriod;
}[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

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
  },
  {
    title: "Billing analytics",
    description: "Invoices, due payments, and collection health.",
    href: "dashboard/billing",
    icon: ReceiptIndianRupee,
  },
  {
    title: "Product analytics",
    description: "Top products, category contribution, and units sold.",
    href: "dashboard/products",
    icon: Package,
  },
  {
    title: "Customer analytics",
    description: "Customer activity, outstanding dues, and repeat billing.",
    href: "dashboard/customers",
    icon: Users,
  },
];
