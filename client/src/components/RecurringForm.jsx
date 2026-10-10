import React, { useState } from "react";
import api from "../api/axios";

const RecurringForm = ({ customers = [], initialData = null, onClose, onSuccess }) => {
  const [customerId, setCustomerId] = useState(
    initialData?.customer?._id || initialData?.customer || (customers[0]?._id || "")
  );
  const [frequency, setFrequency] = useState(initialData?.frequency || "monthly");
  const [dueInDays, setDueInDays] = useState(initialData?.dueInDays || 15);
  const [nextRunDate, setNextRunDate] = useState(
    initialData?.nextRunDate
      ? new Date(initialData.nextRunDate).toISOString().split("T")[0]
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items
      : [{ description: "Monthly Retainer", quantity: 1, price: 500 }]
  );
  const [tax, setTax] = useState(initialData?.tax || 0);
  const [active, setActive] = useState(initialData?.active !== undefined ? initialData.active : true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );
  const total = Math.max(0, subtotal + (Number(tax) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setError("All template items must have a description.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer: customerId,
        frequency,
        dueInDays: Number(dueInDays) || 15,
        nextRunDate,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
        })),
        tax: Number(tax) || 0,
        active,
      };

      let res;
      if (initialData?._id) {
        res = await api.put(`/recurring/${initialData._id}`, payload);
      } else {
        res = await api.post("/recurring", payload);
      }

      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save recurring template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {initialData ? "Edit Recurring Template" : "New Recurring Schedule"}
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

        <form onSubmit={handleSubmit} className="mt-3 space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                required
              >
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Frequency *
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Terms (Days until Due)
              </label>
              <input
                type="number"
                min="1"
                value={dueInDays}
                onChange={(e) => setDueInDays(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Next Run Date *
              </label>
              <input
                type="date"
                value={nextRunDate}
                onChange={(e) => setNextRunDate(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Line items box */}
          <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Items</span>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    className="flex-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    className="w-16 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-1 text-center text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                    className="w-20 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-right text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    className="flex h-6 w-6 items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30"
                    title="Remove item"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span>Tax ($):</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className="w-16 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-right text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                />
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                Cycle Total: ${total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="active-toggle"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
            <label htmlFor="active-toggle" className="text-xs text-slate-700 dark:text-slate-300">
              Active Schedule (generates invoice automatically on due date)
            </label>
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
              {loading ? "Saving..." : initialData ? "Save Changes" : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringForm;
