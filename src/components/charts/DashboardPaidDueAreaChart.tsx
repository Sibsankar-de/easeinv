"use client";

import { DashboardTrendPoint } from "@/types/DashboardAnalyticsType";
import {
  dashboardChartDueColor,
  dashboardChartGridColor,
  dashboardChartPaidColor,
} from "@/constants/dashboard";
import { compactCurrency, formatCurrency } from "@/utils/dashboard-formatters";
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

export const PaidDueAreaChart = ({ data }: { data: DashboardTrendPoint[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={dashboardChartGridColor} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} />
      <YAxis tickFormatter={compactCurrency} tickLine={false} axisLine={false} />
      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
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
