import React from "react";

const StatCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>

      <div className="mt-2">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</h3>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            {trend && (
              <span className={`font-semibold ${trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
