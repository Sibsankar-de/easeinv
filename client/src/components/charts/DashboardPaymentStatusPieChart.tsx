"use client";

import { dashboardChartDueColor, dashboardChartPaidColor, dashboardChartProfitColor } from "@/constants/dashboard";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type PaymentStatusDatum = {
  name: string;
  value: number;
};

const statusColors = [
  dashboardChartPaidColor,
  dashboardChartProfitColor,
  dashboardChartDueColor,
];

export const PaymentStatusPieChart = ({
  data,
}: {
  data: PaymentStatusDatum[];
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius={56}
        outerRadius={104}
        paddingAngle={2}
      >
        {data.map((entry, index) => (
          <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);
