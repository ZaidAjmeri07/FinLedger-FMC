import React from "react";

const statusConfig = {
  paid: {
    label: "Paid",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  partial: {
    label: "Partial",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  sent: {
    label: "Sent",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  draft: {
    label: "Draft",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  },
  overdue: {
    label: "Overdue",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
};

const StatusBadge = ({ status = "draft" }) => {
  const normalized = (status || "draft").toLowerCase();
  const config = statusConfig[normalized] || statusConfig.draft;

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
