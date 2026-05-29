"use client";

import { DashboardTrendPoint } from "@/types/DashboardAnalyticsType";
import {
  dashboardChartGridColor,
  dashboardChartProfitColor,
  dashboardChartRevenueColor,
} from "@/constants/dashboard";
import { compactCurrency, formatCurrency } from "@/utils/currency-formatters";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const RevenueProfitLineChart = ({
  data,
  currencyCode,
}: {
  data: DashboardTrendPoint[];
  currencyCode?: string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={dashboardChartGridColor} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} />
      <YAxis
        tickFormatter={(val) => compactCurrency(val, currencyCode)}
        tickLine={false}
        axisLine={false}
      />
      <Tooltip
        formatter={(value) => formatCurrency(Number(value), currencyCode)}
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="revenue"
        name="Revenue"
        stroke={dashboardChartRevenueColor}
        strokeWidth={2}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="profit"
        name="Profit"
        stroke={dashboardChartProfitColor}
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);
