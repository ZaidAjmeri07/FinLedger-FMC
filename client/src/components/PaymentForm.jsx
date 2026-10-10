import React, { useState } from "react";
import api from "../api/axios";

const PaymentForm = ({ invoice, onClose, onSuccess }) => {
  const currentBalance = Math.max(0, (invoice.total || 0) - (invoice.amountPaid || 0));
  const [amount, setAmount] = useState(currentBalance > 0 ? currentBalance : "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("Bank Transfer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (numAmount > currentBalance) {
      setError(`Payment cannot exceed remaining balance of $${currentBalance.toFixed(2)}.`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/invoices/${invoice._id}/payments`, {
        amount: numAmount,
        date,
        method,
      });
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Record Payment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Invoice <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{invoice.invoiceNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className="my-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs space-y-1">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Total:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">${Number(invoice.total || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Paid:</span>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">${Number(invoice.amountPaid || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 font-bold text-slate-900 dark:text-slate-100">
            <span>Balance Due:</span>
            <span>${currentBalance.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-2.5 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Payment Amount ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={currentBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Payment Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Payment Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
            >
              <option value="Bank Transfer">Bank Transfer / Wire</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / Electronic</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-slate-900 dark:bg-slate-100 px-4 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition disabled:opacity-50"
            >
              {loading ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
