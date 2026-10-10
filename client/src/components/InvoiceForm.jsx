import React, { useState, useEffect } from "react";
import api from "../api/axios";

const InvoiceForm = ({ initialData = null, onSuccess, onCancel }) => {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(initialData?.customer?._id || initialData?.customer || "");
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate
      ? new Date(initialData.issueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split("T")[0]
      : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items
      : [{ description: "", quantity: 1, price: 0 }]
  );
  const [tax, setTax] = useState(initialData?.tax || 0);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [status, setStatus] = useState(initialData?.status || "sent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get("/customers");
        setCustomers(data);
        if (!customerId && data.length > 0) {
          setCustomerId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load customers:", err);
      }
    };
    fetchCustomers();
  }, []);

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
  const numTax = Number(tax) || 0;
  const total = Math.max(0, subtotal + numTax);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setError("All invoice items must have a description.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer: customerId,
        issueDate,
        dueDate,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
        })),
        tax: numTax,
        notes,
        status,
      };

      let res;
      if (initialData?._id) {
        res = await api.put(`/invoices/${initialData._id}`, payload);
      } else {
        res = await api.post("/invoices", payload);
      }

      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Top Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Customer *
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1.5 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
            required
          >
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.email ? `(${c.email})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Issue Date
          </label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mt-1.5 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Due Date *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1.5 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
            required
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Line Items</span>
          <button
            type="button"
            onClick={addItem}
            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => {
            const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
            return (
              <div key={index} className="flex flex-col gap-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Description / Service"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                    required
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-center text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                    required
                  />
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price ($)"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, "price", e.target.value)}
                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1 text-right text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                    required
                  />
                </div>
                <div className="w-24 text-right text-xs font-semibold text-slate-900 dark:text-slate-100">
                  ${lineTotal.toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                  className="flex h-6 w-6 items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30"
                  title="Remove item"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Calculations */}
        <div className="mt-4 flex flex-col items-end border-t border-slate-200 dark:border-slate-700 pt-3 text-xs">
          <div className="w-56 space-y-1.5">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Tax ($):</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-20 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-0.5 text-right text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              />
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 font-bold text-slate-900 dark:text-slate-100">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Notes / Payment Terms
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment instructions or terms..."
            className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Initial Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
          >
            <option value="sent">Sent (Open Receivable)</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-slate-900 dark:bg-slate-100 px-5 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData?._id ? "Update Invoice" : "Create Invoice"}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
