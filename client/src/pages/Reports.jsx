import React, { useState, useEffect } from "react";
import api from "../api/axios";
import CategoryPie from "../components/charts/CategoryPie";
import CashflowChart from "../components/charts/CashflowChart";

const Reports = () => {
  const [months, setMonths] = useState(12);
  const [cashflow, setCashflow] = useState(null);
  const [expenseReport, setExpenseReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const [cfRes, expRes] = await Promise.all([
        api.get(`/reports/cashflow?months=${months}`),
        api.get("/reports/expenses-by-category"),
      ]);
      setCashflow(cfRes.data);
      setExpenseReport(expRes.data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [months]);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center text-xs text-slate-500">
        Aggregating financial reports...
      </div>
    );
  }

  const history = cashflow?.history || [];
  const categories = expenseReport?.categories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Financial Reports</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cash velocity trends, net running balances, and spending allocations
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <span>Lookback:</span>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Cash Inflow vs Outflow</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Revenue collected against operating expenditures</p>
          <div className="mt-3">
            <CashflowChart data={history} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Expenses by Category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of expenditures</p>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Total: ${Number(expenseReport?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2">
            <CategoryPie data={categories} />
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow Ledger Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Cash Flow Ledger</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly cash receipts, expenses, net difference, and cumulative balance
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Month</th>
                <th className="px-5 py-3 text-right">Money In (Revenue)</th>
                <th className="px-5 py-3 text-right">Money Out (Expenses)</th>
                <th className="px-5 py-3 text-right">Net Flow</th>
                <th className="px-5 py-3 text-right">Cumulative Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No historical cash flow data recorded.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">{row.month}</td>
                    <td className="px-5 py-3 text-right font-medium text-emerald-700 dark:text-emerald-400">
                      +${row.in.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-rose-600 dark:text-rose-400">
                      -${row.out.toFixed(2)}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-semibold ${
                        row.net >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {row.net >= 0 ? `+$${row.net.toFixed(2)}` : `-$${Math.abs(row.net).toFixed(2)}`}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${row.runningBalance.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
