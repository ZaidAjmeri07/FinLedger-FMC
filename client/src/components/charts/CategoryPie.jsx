import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = [
  "#2563eb", // Blue
  "#db2777", // Pink
  "#d97706", // Amber
  "#059669", // Emerald
  "#0284c7", // Sky
  "#7c3aed", // Purple
  "#64748b", // Slate
];

const CategoryPie = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-xs text-slate-400">
        No category breakdown available.
      </div>
    );
  }

  return (
    <div className="flex h-60 w-full flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
              name,
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
        </PieChart>
      </ResponsiveContainer>

      {/* Legend Grid */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px]">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.category} className="flex items-center gap-1.5 text-slate-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span>{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPie;
