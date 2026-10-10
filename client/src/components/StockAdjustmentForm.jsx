import React, { useState } from "react";
import api from "../api/axios";

const StockAdjustmentForm = ({ initialData, onClose, onSuccess }) => {
  const [reason, setReason] = useState(initialData?.reason || "");
  const [quantityChange, setQuantityChange] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const payload = {
        quantityChange: Number(quantityChange),
        reason: reason.trim(),
      };

      const res = await api.post(`/inventory/${initialData._id}/adjust`, payload);

      onSuccess(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to adjust inventory stock."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {initialData ? "Adjust Stock" : "Adjust Stock"}
          </h3>
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

        {error && (
          <div className="my-3 rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-2.5 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Item *
            </label>
            <p className="mt-1 w-full text-sm text-slate-500 dark:text-slate-400">
              {initialData?.name || "Select an inventory item"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Quantity Change *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <button
                  type="button"
                  onClick={() => setQuantityChange((q) => q - 1)}
                  className="flex-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  disabled={quantityChange <= -initialData.quantity}
                >
                  -1
                </button>
              </div>
              <div>
                <input
                  type="number"
                  min={-initialData.quantity}
                  max="999999"
                  step="1"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                  required
                />
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  (Negative = remove, Positive = add)
                </span>
              </div>
            </div>
            <small className="text-xs text-slate-500 dark:text-slate-400">
              Current quantity: {initialData?.quantity}, New quantity will be: {initialData?.quantity + Number(quantityChange)}
            </small>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Reason (Optional)
            </label>
            <textarea
              rows="2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sale, damage, transfer, adjustment..."
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
            />
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
              {loading ? "Saving..." : "Adjust Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentForm;