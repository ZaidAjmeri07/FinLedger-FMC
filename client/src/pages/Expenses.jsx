import React, { useState, useEffect } from "react";
import api from "../api/axios";
import RoleGate from "../components/RoleGate";
import ExpenseForm from "../components/ExpenseForm";

const CATEGORIES = ["Rent", "Salaries", "Supplies", "Utilities", "Marketing", "Travel", "Other"];

const categoryBadges = {
  Rent: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Salaries: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Supplies: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Utilities: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  Marketing: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  Travel: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  Other: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchExpenses = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const { data } = await api.get("/expenses", { params });
      setExpenses(data.expenses || []);
      setTotalSpend(data.total || 0);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, fromDate, toDate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense record?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      setSuccessMsg("Expense deleted.");
      fetchExpenses();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete expense.");
    }
  };

  const filtered = expenses.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Expenses</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Record operational expenditures and monitor department spending</p>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setModalOpen(true);
          }}
          className="rounded bg-slate-900 dark:bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition"
        >
          + Record Expense
        </button>
      </div>

      {successMsg && (
        <div className="rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {successMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 lg:flex-row lg:items-center lg:justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-200"
            />
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-200"
            />
            {(selectedCategory || fromDate || toDate) && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setFromDate("");
                  setToDate("");
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 lg:border-t-0 lg:pt-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Spend:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            ${Number(totalSpend).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3">Expense Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Notes</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Loading expenses...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  No expense records found.
                </td>
              </tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">{exp.title}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium border ${
                        categoryBadges[exp.category] || categoryBadges.Other
                      }`}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    ${Number(exp.amount).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {exp.notes || "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingExpense(exp);
                          setModalOpen(true);
                        }}
                        className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Edit
                      </button>
                      <RoleGate role="admin">
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                        >
                          Delete
                        </button>
                      </RoleGate>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ExpenseForm
          initialData={editingExpense}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchExpenses();
          }}
        />
      )}
    </div>
  );
};

export default Expenses;
