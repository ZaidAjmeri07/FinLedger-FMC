import React from "react";
import api from "../api/axios";

const ReportModal = ({ isOpen, setIsOpen, onExport }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/inventory/report");
      setReportData(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch inventory report."
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReport();
  }, []);

  if (!reportData) {
    return (
      <div className="hidden">
        <span>Loading report...</span>
      </div>
    );
  }

  const formatCurrency = (num) =>
    Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90%] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shadow-2xl transform transition-all duration-300 ease-in-out sm:max-w-md sm:p-8">
        <button
          type="button"
          onClick={setIsOpen}
          className="absolute top-4 right-4 rounded-full bg-slate-100 dark:bg-slate-700 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 focus:ring-offset-white"
          aria-label="Close report"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Inventory Report
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Comprehensive analytics for your inventory management
          </p>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Items</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {reportData.totalItems}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Value</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                ${formatCurrency(reportData.totalValue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Low Stock</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {reportData.lowStockCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {reportData.outOfStockCount}
              </p>
            </div>
          </div>

          {/* Valuation by Unit Section */}
          {reportData.byUnit && reportData.byUnit.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Valuation by Unit
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      <th className="px-4 py-2">Unit</th>
                      <th className="px-4 py-2">Items</th>
                      <th className="px-4 py-2 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.byUnit).map(([unit, count]) => (
                      <tr key={unit} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-2">
                          <span className="text-slate-600 dark:text-slate-400">{unit || "pcs"}</span>
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-slate-900 dark:text-slate-100">
                          {count}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${formatCurrency(reportData.valuationByUnit[unit] || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Items Summary */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Inventory Items
            </h3>
            <div className="space-y-2 text-sm">
              {reportData.inventories.slice(0, 10).map((item) => (
                <div key={item._id} className="flex justify-between items-center p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-800 dark:text-slate-200 truncate w-48">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.quantity} {item.unit || "pcs"}
                    </span>
                    <span className={`text-[10px] font-medium ${item.quantity <= (item.minStock || 0) ? "text-red-600" : "text-green-600"} dark:text-${item.quantity <= (item.minStock || 0) ? "red-400" : "green-400"}`}>
                      {item.quantity <= (item.minStock || 0) ? "Low" : "Good"}
                    </span>
                  </div>
                </div>
              ))}
              {reportData.inventories.length > 10 && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    +{reportData.inventories.length - 10} more items
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onExport}
              className="rounded bg-slate-800 dark:bg-slate-200 px-4 py-2 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white transition w-full"
            >
              Export Data
            </button>
            <button
              onClick={setIsOpen}
              className="rounded bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-medium text-white dark:text-slate-900 mt-2 hover:bg-slate-800 dark:hover:bg-white transition w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;