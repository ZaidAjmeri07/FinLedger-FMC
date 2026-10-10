import React, { useState, useEffect } from "react";
import api from "../api/axios";
import RoleGate from "../components/RoleGate";
import RecurringForm from "../components/RecurringForm";

const Recurring = () => {
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [runningNow, setRunningNow] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");

  const fetchData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        api.get("/recurring"),
        api.get("/customers"),
      ]);
      setTemplates(tRes.data);
      setCustomers(cRes.data);
    } catch (err) {
      console.error("Failed to load recurring templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunNow = async () => {
    setRunningNow(true);
    setBannerMsg("");
    try {
      const { data } = await api.post("/recurring/run-now");
      setBannerMsg(data.message || "Recurring generation completed!");
      fetchData();
    } catch (err) {
      setBannerMsg(err.response?.data?.message || "Failed to trigger recurring run.");
    } finally {
      setRunningNow(false);
      setTimeout(() => setBannerMsg(""), 4000);
    }
  };

  const handleToggleActive = async (template) => {
    try {
      await api.put(`/recurring/${template._id}`, { active: !template.active });
      fetchData();
    } catch (err) {
      alert("Failed to toggle template status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recurring template?")) return;
    try {
      await api.delete(`/recurring/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete template.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Recurring Invoices</h2>
          <p className="text-xs text-slate-500">Automate recurring client billing schedules and subscriptions</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunNow}
            disabled={runningNow}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {runningNow ? "Generating Invoices..." : "Run Due Invoices Now"}
          </button>

          <button
            onClick={() => {
              setEditingTemplate(null);
              setModalOpen(true);
            }}
            className="rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
          >
            + New Schedule
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div className="rounded border border-blue-200 bg-blue-50 p-2.5 text-xs font-medium text-blue-700">
          {bannerMsg}
        </div>
      )}

      {/* Templates Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Frequency</th>
              <th className="px-5 py-3">Next Run Date</th>
              <th className="px-5 py-3">Last Run</th>
              <th className="px-5 py-3">Terms</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  Loading recurring schedules...
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  No recurring schedules created yet.
                </td>
              </tr>
            ) : (
              templates.map((tpl) => (
                <tr key={tpl._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{tpl.customer?.name || "Customer"}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {tpl.items?.length || 0} item(s) &middot; Tax: ${tpl.tax || 0}
                    </p>
                  </td>
                  <td className="px-5 py-3 font-medium capitalize text-slate-800 dark:text-slate-200">
                    {tpl.frequency}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                    {new Date(tpl.nextRunDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {tpl.lastRunAt ? new Date(tpl.lastRunAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">Due in {tpl.dueInDays || 15} days</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(tpl)}
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium border ${
                        tpl.active
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {tpl.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingTemplate(tpl);
                          setModalOpen(true);
                        }}
                        className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Edit
                      </button>
                      <RoleGate role="admin">
                        <button
                          onClick={() => handleDelete(tpl._id)}
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
        <RecurringForm
          customers={customers}
          initialData={editingTemplate}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default Recurring;
