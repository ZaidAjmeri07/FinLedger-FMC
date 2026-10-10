import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import RoleGate from "../components/RoleGate";
import PaymentForm from "../components/PaymentForm";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [actionMsg, setActionMsg] = useState("");

  const fetchInvoices = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (customerFilter) params.customer = customerFilter;

      const { data } = await api.get("/invoices", { params });
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get("/customers");
        setCustomers(data);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, customerFilter]);

  const handleDelete = async (id, invoiceNumber) => {
    if (!window.confirm(`Delete invoice ${invoiceNumber}?`)) return;
    try {
      await api.delete(`/invoices/${id}`);
      setActionMsg(`Invoice ${invoiceNumber} deleted.`);
      fetchInvoices();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete invoice.");
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download invoice PDF.");
    }
  };

  const filtered = invoices.filter((inv) => {
    const term = search.toLowerCase();
    const invNum = (inv.invoiceNumber || "").toLowerCase();
    const custName = (inv.customer?.name || "").toLowerCase();
    return invNum.includes(term) || custName.includes(term);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Invoices</h2>
          <p className="text-xs text-slate-500">Create, monitor, and collect payments on business invoices</p>
        </div>

        <Link
          to="/invoices/new"
          className="rounded bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition"
        >
          + New Invoice
        </Link>
      </div>

      {actionMsg && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800">
          {actionMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">Search:</span>
          <input
            type="text"
            placeholder="Invoice number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent / Open</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Issue Date</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Balance Due</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No invoices match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const balance = Math.max(0, (inv.total || 0) - (inv.amountPaid || 0));
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="px-5 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        <Link to={`/invoices/${inv._id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {inv.customer?.name || "Customer"}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                        ${Number(inv.total).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        <span className={balance > 0 ? "text-slate-900 dark:text-slate-100" : "text-emerald-700 dark:text-emerald-400"}>
                          ${balance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {balance > 0 && (
                            <button
                              onClick={() => setPaymentInvoice(inv)}
                              className="rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                              title="Record payment"
                            >
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                            title="Download PDF"
                          >
                            PDF
                          </button>
                          <Link
                            to={`/invoices/${inv._id}/edit`}
                            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Edit
                          </Link>
                          <RoleGate role="admin">
                            <button
                              onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                              title="Delete invoice"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </RoleGate>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentInvoice && (
        <PaymentForm
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            setPaymentInvoice(null);
            fetchInvoices();
            setActionMsg("Payment recorded successfully.");
            setTimeout(() => setActionMsg(""), 3000);
          }}
        />
      )}
    </div>
  );
};

export default Invoices;
