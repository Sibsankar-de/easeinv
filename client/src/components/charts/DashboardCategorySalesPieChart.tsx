"use client";

import { CategoryAnalytics } from "@/types/DashboardAnalyticsType";
import { dashboardChartColors } from "@/constants/dashboard";
import { formatCurrency } from "@/utils/dashboard-formatters";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const CategorySalesPieChart = ({
  data,
}: {
  data: CategoryAnalytics[];
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        dataKey="revenue"
        nameKey="name"
        innerRadius={58}
        outerRadius={104}
        paddingAngle={2}
      >
        {data.map((entry, index) => (
          <Cell
            key={entry.categoryId}
            fill={dashboardChartColors[index % dashboardChartColors.length]}
          />
        ))}
      </Pie>
      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);
