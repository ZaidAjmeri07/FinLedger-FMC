import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";

const BUCKET_COLORS = {
  "1-30 days": "#f59e0b", // Amber
  "31-60 days": "#f97316", // Orange
  "61+ days": "#ef4444", // Red
};

const AgingBars = ({ buckets = {} }) => {
  const chartData = [
    { range: "1-30 days", total: buckets["1-30"]?.total || 0, count: buckets["1-30"]?.count || 0 },
    { range: "31-60 days", total: buckets["31-60"]?.total || 0, count: buckets["31-60"]?.count || 0 },
    { range: "61+ days", total: buckets["61+"]?.total || 0, count: buckets["61+"]?.count || 0 },
  ];

  const hasData = chartData.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        No overdue receivables. All accounts are up to date.
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            formatter={(value, name, item) => [
              `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${item.payload.count} invoices)`,
              "Overdue Balance",
            ]}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: "0.375rem",
              fontSize: "11px",
              color: "#0f172a",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.range} fill={BUCKET_COLORS[entry.range] || "#ef4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgingBars;
