import React, { useState, useEffect } from "react";
import api from "../api/axios";
import RoleGate from "../components/RoleGate";
import InventoryForm from "../components/InventoryForm";
import StockAdjustmentForm from "../components/StockAdjustmentForm";
import ReportModal from "../components/ReportModal";

const INVENTORY_UNITS = ["pcs", "kg", "liters", "boxes", "pairs", "sets"];
const STATUS_BADGES = {
  low: "bg-red-500",
  adequate: "bg-amber-500",
  good: "bg-green-500",
};

const Inventory = () => {
  const [inventories, setInventories] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" | "edit" | "adjust"
  const [editingInventory, setEditingInventory] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchInventories = async () => {
    try {
      const params = {};

      if (lowStockOnly) {
        params.lowStock = true;
      } else if (selectedFilter !== "all") {
        params.lowStock = selectedFilter === "low";
      }

      const { data } = await api.get("/inventory", { params });
      setInventories(data.inventories || []);
      setTotalValue(data.totalValue || 0);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const { data } = await api.get("/inventory/report");
      setReportData(data);
      setShowReport(true);
    } catch (err) {
      console.error("Failed to fetch inventory report:", err);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, [selectedFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      setSuccessMsg("Inventory item deleted.");
      fetchInventories();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete inventory item.");
    }
  };

  const filtered = inventories.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusClass = (item) => {
    if (!item.reorderPoint) return "";
    if (item.quantity <= 0) return STATUS_BADGES.low;
    if (item.quantity <= item.reorderPoint) return STATUS_BADGES.low;
    if (item.quantity < item.minStock * 2) return STATUS_BADGES.adequate;
    return STATUS_BADGES.good;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Inventory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track stock levels, SKUs, and reorder points</p>
        </div>

        <button
          onClick={() => {
            setEditingInventory(null);
            setModalOpen(true);
          }}
          className="rounded bg-slate-900 dark:bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition"
        >
          + Add Item
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
            <span className="text-slate-500 dark:text-slate-400">Filter:</span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Items</option>
              <option value="low">Low Stock</option>
              <option value="adequate">Adequate</option>
              <option value="good">Good Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Search:</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-200"
              placeholder="Search by name or SKU..."
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="rounded w-4 h-4 text-slate-600 focus:ring-slate-500"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">Low stock only</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 lg:border-t-0 lg:pt-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Items:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {inventories.length}
          </span>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 lg:border-t-0 lg:pt-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Value:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            ${Number(totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 lg:border-t-0 lg:pt-0">
          <button
            onClick={() => {
              fetchReport();
              setReportModalOpen(true);
            }}
            className="rounded bg-slate-800 dark:bg-slate-200 px-2.5 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white transition"
            title="Generate Inventory Report"
          >
            Report
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3">Item Name</th>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3">Quantity</th>
              <th className="px-5 py-3">Unit</th>
              <th className="px-5 py-3">Min Stock</th>
              <th className="px-5 py-3">Reorder Pt</th>
              <th className="px-5 py-3 text-right">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
              <th className="px-5 py-3 text-right">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-400">
                  Loading inventory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-400">
                  No inventory records found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {item.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {item.sku || "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-slate-500 dark:text-slate-400">{item.unit || "pcs"}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">
                    {item.minStock}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">
                    {item.reorderPoint}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${getStatusClass(item)}`}
                    >
                      {item.quantity <= 0 ? "OUT OF STOCK" : item.quantity <= item.reorderPoint ? "LOW STOCK" : "ADEQUATE"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingInventory(item);
                          setModalType("edit");
                          setModalOpen(true);
                        }}
                        className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Edit
                      </button>
                      <RoleGate role="admin">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                        >
                          Delete
                        </button>
                      </RoleGate>
                      <RoleGate role="admin">
                        <button
                          onClick={() => {
                            setEditingInventory(item);
                            setModalType("adjust");
                            setModalOpen(true);
                          }}
                          className="rounded border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/40 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-100/80"
                          title="Adjust stock"
                        >
                          +/-
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
        modalType === "adjust"
          ? <StockAdjustmentForm
            initialData={editingInventory}
            onClose={() => {
              setModalOpen(false);
              setModalType("add");
            }}
            onSuccess={() => {
              setModalOpen(false);
              fetchInventories();
            }}
          />
          : <InventoryForm
            initialData={editingInventory}
            onClose={() => {
              setModalOpen(false);
              setModalType("add");
            }}
            onSuccess={() => {
              setModalOpen(false);
              fetchInventories();
            }}
          />
        )}
      {reportModalOpen && <ReportModal isOpen={true} setIsOpen={() => setReportModalOpen(false)} onExport={() => fetchReport()} />}
    </div>
  );
};

export default Inventory;