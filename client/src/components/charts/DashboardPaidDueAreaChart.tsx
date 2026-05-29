"use client";

import { DashboardTrendPoint } from "@/types/DashboardAnalyticsType";
import {
  dashboardChartDueColor,
  dashboardChartGridColor,
  dashboardChartPaidColor,
} from "@/constants/dashboard";
import { compactCurrency, formatCurrency } from "@/utils/currency-formatters";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const PaidDueAreaChart = ({
  data,
  currencyCode,
}: {
  data: DashboardTrendPoint[];
  currencyCode?: string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
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
      <Area
        type="monotone"
        dataKey="paid"
        name="Paid"
        stroke={dashboardChartPaidColor}
        fill={dashboardChartPaidColor}
        fillOpacity={0.1}
        strokeWidth={2}
      />
      <Area
        type="monotone"
        dataKey="due"
        name="Due"
        stroke={dashboardChartDueColor}
        fill={dashboardChartDueColor}
        fillOpacity={0.08}
        strokeWidth={2}
      />
    </AreaChart>
  </ResponsiveContainer>
);
