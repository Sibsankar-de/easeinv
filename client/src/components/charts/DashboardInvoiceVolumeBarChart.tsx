"use client";

import { DashboardTrendPoint } from "@/types/DashboardAnalyticsType";
import {
  dashboardChartGridColor,
  dashboardChartVolumeColor,
} from "@/constants/dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const InvoiceVolumeBarChart = ({
  data,
}: {
  data: DashboardTrendPoint[];
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={dashboardChartGridColor} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} />
      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
      <Tooltip />
      <Bar
        dataKey="invoices"
        name="Invoices"
        fill={dashboardChartVolumeColor}
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
);
