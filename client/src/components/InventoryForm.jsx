import React, { useState } from "react";
import api from "../api/axios";

const InventoryForm = ({ initialData = null, onClose, onSuccess }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [quantity, setQuantity] = useState(initialData?.quantity || 0);
  const [unit, setUnit] = useState(initialData?.unit || "pcs");
  const [minStock, setMinStock] = useState(initialData?.minStock || 0);
  const [maxStock, setMaxStock] = useState(initialData?.maxStock !== undefined ? initialData.maxStock : null);
  const [costPrice, setCostPrice] = useState(initialData?.costPrice || 0);
  const [salePrice, setSalePrice] = useState(initialData?.salePrice || 0);
  const [reorderPoint, setReorderPoint] = useState(initialData?.reorderPoint || 0);
  const [location, setLocation] = useState(initialData?.location || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim() || undefined,
        quantity: Number(quantity),
        unit: unit || "pcs",
        minStock: Number(minStock),
        maxStock: maxStock !== null ? maxStock : undefined,
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        reorderPoint: Number(reorderPoint),
        location: location.trim() || undefined,
        notes: notes.trim(),
      };

      let res;
      if (initialData?._id) {
        res = await api.put(`/inventory/${initialData._id}`, payload);
      } else {
        res = await api.post("/inventory", payload);
      }

      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save inventory item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {initialData ? "Edit Inventory Item" : "Add Inventory Item"}
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
              Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Organic Coffee Beans 500g"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                SKU (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. COF-500G"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Quantity *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="liters">liters</option>
                <option value="boxes">boxes</option>
                <option value="pairs">pairs</option>
                <option value="sets">sets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Min Stock *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                required
              />
            </div>
          </div>

          {maxStock !== null && maxStock >= 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Max Stock
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Sale Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Reorder Point *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Location (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shelf A-1, Warehouse B"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vendor notes or stock details..."
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
              {loading ? "Saving..." : initialData ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;