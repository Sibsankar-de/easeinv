"use client";

import { DashboardTrendPoint } from "@/types/DashboardAnalyticsType";
import {
  dashboardChartDueColor,
  dashboardChartGridColor,
  dashboardChartPaidColor,
  dashboardChartRevenueColor,
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

export const SalesTrendAreaChart = ({
  data,
}: {
  data: DashboardTrendPoint[];
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={dashboardChartRevenueColor} stopOpacity={0.28} />
          <stop offset="95%" stopColor={dashboardChartRevenueColor} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={dashboardChartGridColor} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} />
      <YAxis tickFormatter={compactCurrency} tickLine={false} axisLine={false} />
      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
      <Legend />
      <Area
        type="monotone"
        dataKey="revenue"
        name="Revenue"
        stroke={dashboardChartRevenueColor}
        fill="url(#revenueFill)"
        strokeWidth={2}
      />
      <Area
        type="monotone"
        dataKey="paid"
        name="Paid"
        stroke={dashboardChartPaidColor}
        fill={dashboardChartPaidColor}
        fillOpacity={0.08}
        strokeWidth={2}
      />
      <Area
        type="monotone"
        dataKey="due"
        name="Due"
        stroke={dashboardChartDueColor}
        fill={dashboardChartDueColor}
        fillOpacity={0.06}
        strokeWidth={2}
      />
    </AreaChart>
  </ResponsiveContainer>
);
