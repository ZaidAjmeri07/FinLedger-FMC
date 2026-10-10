import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import CashflowChart from "../components/charts/CashflowChart";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [cashflow, setCashflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triggeringRun, setTriggeringRun] = useState(false);
  const [runMessage, setRunMessage] = useState("");

  const fetchData = async () => {
    try {
      const [sumRes, cfRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/cashflow"),
      ]);
      setSummary(sumRes.data);
      setCashflow(cfRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load dashboard data. Check server and database connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunRecurringNow = async () => {
    setTriggeringRun(true);
    setRunMessage("");
    try {
      const { data } = await api.post("/recurring/run-now");
      setRunMessage(data.message || "Recurring generation completed.");
      fetchData();
    } catch (err) {
      setRunMessage(err.response?.data?.message || "Failed to trigger recurring generation.");
    } finally {
      setTriggeringRun(false);
      setTimeout(() => setRunMessage(""), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center text-xs text-slate-500">
        Loading financial dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-xs text-slate-500">Overview of revenue, expenses, and outstanding receivables</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunRecurringNow}
            disabled={triggeringRun}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            title="Scan active templates and generate due invoices now"
          >
            {triggeringRun ? "Running..." : "Run Invoices Now"}
          </button>

          <Link
            to="/invoices/new"
            className="rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
          >
            + New Invoice
          </Link>
        </div>
      </div>

      {runMessage && (
        <div className="rounded border border-blue-200 bg-blue-50 p-2.5 text-xs font-medium text-blue-700">
          {runMessage}
        </div>
      )}

      {error && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Revenue (Cash)"
          value={`$${Number(summary?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Payments collected"
        />

        <StatCard
          title="Expenses"
          value={`$${Number(summary?.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Operating burn"
        />

        <StatCard
          title="Net Profit"
          value={`$${Number(summary?.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Revenue minus expenses"
        />

        <StatCard
          title="Outstanding"
          value={`$${Number(summary?.outstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Unpaid balances"
        />

        <StatCard
          title="Overdue Receivables"
          value={`$${Number(summary?.overdue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Past due date"
        />
      </div>

      {/* Cash Flow Chart & Expected Inflows */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Cash Flow (Monthly In vs Out)</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Collected revenue compared to operating expenses</p>
            </div>
            <Link to="/reports" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              <span>Detailed Ledger</span>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="pt-3">
            <CashflowChart data={cashflow?.history || []} />
          </div>
        </div>

        {/* Inflows Pipeline */}
        <div className="flex flex-col justify-between gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Expected Inflows (Next 30 Days)
            </span>
            <h4 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${Number(cashflow?.expectedInflowsNext30Days || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Open receivables scheduled to mature within the next month.
            </p>
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
              <Link to="/receivables" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                <span>View Aging Breakdown</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Customers</p>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{summary?.totalCustomers || 0}</h4>
              </div>
              <Link
                to="/customers"
                className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Manage
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Invoices Billed</p>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{summary?.totalInvoices || 0}</h4>
              </div>
              <Link
                to="/invoices"
                className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices & Payments */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Invoices */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Invoices</h3>
            <Link to="/invoices" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              View all ({summary?.totalInvoices || 0})
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(summary?.recentInvoices || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No invoices generated yet.</p>
            ) : (
              (summary?.recentInvoices || []).map((inv) => (
                <div key={inv._id} className="flex items-center justify-between py-2.5">
                  <div>
                    <Link
                      to={`/invoices/${inv._id}`}
                      className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{inv.customer?.name || "Customer"}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">${Number(inv.total).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400">
                        Due {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments Received */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Payments Received</h3>
            <span className="text-xs text-slate-400">Cash Flow In</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(summary?.recentPayments || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No payments recorded yet.</p>
            ) : (
              (summary?.recentPayments || []).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{p.customerName}</p>
                    <p className="text-[10px] text-slate-400">
                      via {p.method} &middot; {new Date(p.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      +${Number(p.amount).toFixed(2)}
                    </span>
                    <p className="font-mono text-[10px] text-slate-400">{p.invoiceNumber}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
