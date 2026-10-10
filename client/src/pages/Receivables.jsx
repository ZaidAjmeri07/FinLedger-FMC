import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AgingBars from "../components/charts/AgingBars";
import PaymentForm from "../components/PaymentForm";

const bucketBadgeColors = {
  "1-30": "bg-amber-50 text-amber-700 border-amber-200",
  "31-60": "bg-orange-50 text-orange-700 border-orange-200",
  "61+": "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
};

const Receivables = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBucketFilter, setActiveBucketFilter] = useState("all");
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    try {
      const res = await api.get("/receivables/overdue");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load receivables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center text-xs text-slate-500">
        Loading receivables and aging buckets...
      </div>
    );
  }

  const buckets = data?.buckets || {};
  const overdueList = data?.overdueList || [];

  const filteredList = overdueList.filter((inv) => {
    if (activeBucketFilter === "all") return true;
    return inv.bucket === activeBucketFilter;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Overdue Receivables & Aging</h2>
        <p className="text-xs text-slate-500">
          Track delinquent accounts and manage receivables by aging cohorts
        </p>
      </div>

      {successMsg && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Overdue */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Overdue Balance
          </span>
          <h3 className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">
            ${Number(data?.totalOverdue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{data?.count || 0} overdue invoices</p>
        </div>

        {/* 1-30 Days */}
        <div
          onClick={() => setActiveBucketFilter(activeBucketFilter === "1-30" ? "all" : "1-30")}
          className={`cursor-pointer rounded-lg border p-4 transition shadow-sm ${
            activeBucketFilter === "1-30"
              ? "border-slate-800 dark:border-slate-200 bg-slate-50 dark:bg-slate-800"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">1 – 30 Days</span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-700 dark:text-slate-300">
              {buckets["1-30"]?.count || 0}
            </span>
          </div>
          <h4 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            ${Number(buckets["1-30"]?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Early overdue</p>
        </div>

        {/* 31-60 Days */}
        <div
          onClick={() => setActiveBucketFilter(activeBucketFilter === "31-60" ? "all" : "31-60")}
          className={`cursor-pointer rounded-lg border p-4 transition shadow-sm ${
            activeBucketFilter === "31-60"
              ? "border-slate-800 dark:border-slate-200 bg-slate-50 dark:bg-slate-800"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">31 – 60 Days</span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-700 dark:text-slate-300">
              {buckets["31-60"]?.count || 0}
            </span>
          </div>
          <h4 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            ${Number(buckets["31-60"]?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Moderate risk</p>
        </div>

        {/* 61+ Days */}
        <div
          onClick={() => setActiveBucketFilter(activeBucketFilter === "61+" ? "all" : "61+")}
          className={`cursor-pointer rounded-lg border p-4 transition shadow-sm ${
            activeBucketFilter === "61+"
              ? "border-slate-800 dark:border-slate-200 bg-slate-50 dark:bg-slate-800"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">61+ Days</span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-700 dark:text-slate-300">
              {buckets["61+"]?.count || 0}
            </span>
          </div>
          <h4 className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">
            ${Number(buckets["61+"]?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">High risk</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Receivables Aging Distribution</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Overdue capital grouped by aging window</p>
        <div className="mt-3">
          <AgingBars buckets={buckets} />
        </div>
      </div>

      {/* Overdue List Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-3.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Delinquent Accounts {activeBucketFilter !== "all" ? `(${activeBucketFilter} days)` : ""}
          </h4>
          {activeBucketFilter !== "all" && (
            <button
              onClick={() => setActiveBucketFilter("all")}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Show all buckets
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3 text-center">Days Overdue</th>
                <th className="px-5 py-3 text-center">Cohort</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Balance Due</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                    No overdue invoices in this bracket. All accounts are settled.
                  </td>
                </tr>
              ) : (
                filteredList.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      <Link to={`/invoices/${inv._id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {inv.customer?.name || "Customer"}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-rose-600 dark:text-rose-400">
                      {inv.daysOverdue} d
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-medium border ${
                          bucketBadgeColors[inv.bucket] || bucketBadgeColors["1-30"]
                        }`}
                      >
                        {inv.bucket} days
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">
                      ${Number(inv.total).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      ${Number(inv.balance).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPaymentInvoice(inv)}
                          className="rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                        >
                          Record Payment
                        </button>
                        <Link
                          to={`/invoices/${inv._id}`}
                          className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {paymentInvoice && (
        <PaymentForm
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            setPaymentInvoice(null);
            fetchData();
            setSuccessMsg("Payment applied successfully to overdue account.");
            setTimeout(() => setSuccessMsg(""), 3000);
          }}
        />
      )}
    </div>
  );
};

export default Receivables;
