import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTeam = async () => {
    try {
      const { data } = await api.get("/team");
      setMembers(data);
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill out all fields.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/team", formData);
      setSuccessMsg("Accountant added successfully.");
      setModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      fetchTeam();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add team member.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Revoke access for ${name}?`)) return;
    try {
      await api.delete(`/team/${id}`);
      setSuccessMsg(`${name} removed.`);
      fetchTeam();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Team & Permissions (RBAC)</h2>
          <p className="text-xs text-slate-500">
            Manage authorized users and review role-based access policies
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
          className="rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
        >
          + Add Accountant
        </button>
      </div>

      {successMsg && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* RBAC Matrix */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Role Access Matrix
        </h3>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="pb-2">Action / Feature</th>
                <th className="pb-2 text-center">Business Admin</th>
                <th className="pb-2 text-center">Accountant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2.5">Create / Edit Customers, Invoices, Expenses, Payments</td>
                <td className="py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-medium">Allowed</td>
                <td className="py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-medium">Allowed</td>
              </tr>
              <tr>
                <td className="py-2.5">Create & Update Recurring Templates</td>
                <td className="py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-medium">Allowed</td>
                <td className="py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-medium">Allowed</td>
              </tr>
              <tr>
                <td className="py-2.5">View Financial Dashboards & Cash Flow Reports</td>
                <td className="py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-medium">Allowed</td>
                <td className="py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-medium">Allowed</td>
              </tr>
              <tr>
                <td className="py-2.5">Delete Invoices, Customers, Expenses, or Templates</td>
                <td className="py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-medium">Allowed</td>
                <td className="py-2.5 text-center text-rose-600 dark:text-rose-400 font-medium">No (Admin Only)</td>
              </tr>
              <tr>
                <td className="py-2.5">Manage Team Accounts & Role Assignment</td>
                <td className="py-2.5 text-center text-emerald-700 dark:text-emerald-400 font-medium">Allowed</td>
                <td className="py-2.5 text-center text-rose-600 dark:text-rose-400 font-medium">No (Admin Only)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Members List */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-800 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Active Team Members</h3>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3">Member Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Date Added</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">
                  Loading team members...
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const isSelf = m._id === user?._id;
                return (
                  <tr key={m._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {m.name} {isSelf && <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">(You)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{m.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-medium border ${
                          m.role === "admin"
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!isSelf && m.role !== "admin" ? (
                        <button
                          onClick={() => handleRemove(m._id, m.name)}
                          className="rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Accountant</h3>
              <button
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Sarah Chen"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="sarah@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-slate-900 dark:bg-slate-100 px-4 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
