"use client";

import { compactCurrency, formatCurrency } from "@/utils/dashboard-formatters";
import { dashboardChartGridColor, dashboardChartRevenueColor } from "@/constants/dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartRow = Record<string, string | number | undefined>;

export const HorizontalCurrencyBarChart = ({
  data,
  dataKey,
  name,
  color = dashboardChartRevenueColor,
  yAxisKey = "name",
}: {
  data: ChartRow[];
  dataKey: string;
  name: string;
  color?: string;
  yAxisKey?: string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke={dashboardChartGridColor} />
      <XAxis type="number" tickFormatter={compactCurrency} />
      <YAxis
        dataKey={yAxisKey}
        type="category"
        width={125}
        tickLine={false}
        axisLine={false}
      />
      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
      <Bar dataKey={dataKey} name={name} fill={color} radius={[0, 6, 6, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
