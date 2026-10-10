import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import PaymentForm from "../components/PaymentForm";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const fetchInvoice = async () => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data);
    } catch (err) {
      setError("Failed to load invoice details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setDownloadingPDF(true);
    try {
      const response = await api.get(`/invoices/${invoice._id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download invoice PDF.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center text-xs text-slate-500">
        Loading invoice details...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
        {error || "Invoice not found"}
        <div className="mt-3">
          <Link to="/invoices" className="text-blue-600 hover:underline">
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const balance = Math.max(0, (invoice.total || 0) - (invoice.amountPaid || 0));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Top Bar Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate("/invoices")}
            className="mb-1 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Invoices</span>
          </button>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</h2>
            <StatusBadge status={invoice.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {balance > 0 && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="rounded bg-slate-900 dark:bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition"
            >
              Record Payment
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            {downloadingPDF ? "Generating PDF..." : "Download PDF"}
          </button>

          <Link
            to={`/invoices/${invoice._id}/edit`}
            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        {/* Bill To & Metadata */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 sm:flex-row">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Billed To</span>
            <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">{invoice.customer?.name}</h3>
            {invoice.customer?.email && <p className="text-xs text-slate-600 dark:text-slate-400">{invoice.customer.email}</p>}
            {invoice.customer?.phone && <p className="text-xs text-slate-600 dark:text-slate-400">{invoice.customer.phone}</p>}
            {invoice.customer?.address && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{invoice.customer.address}</p>}
          </div>

          <div className="space-y-1 text-xs sm:text-right">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Issue Date: </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Due Date: </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </span>
            </div>
            {invoice.recurringSource && (
              <div className="pt-1">
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                  Recurring: {invoice.recurringSource.frequency}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-5">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="pb-2.5">Description</th>
                <th className="pb-2.5 text-center">Qty</th>
                <th className="pb-2.5 text-right">Unit Price</th>
                <th className="pb-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {(invoice.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 font-medium text-slate-900 dark:text-slate-100">{item.description}</td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right">${Number(item.price).toFixed(2)}</td>
                  <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                    ${(Number(item.quantity) * Number(item.price)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col items-end border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="w-56 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">${Number(invoice.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 font-bold text-slate-900 dark:text-slate-100">
              <span>Total:</span>
              <span>${Number(invoice.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Amount Paid:</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">${Number(invoice.amountPaid).toFixed(2)}</span>
            </div>
            <div className="flex justify-between rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 font-bold text-slate-900 dark:text-slate-100">
              <span>Balance Due:</span>
              <span>${balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Notes / Terms</span>
            <p className="mt-1 text-slate-700 dark:text-slate-300 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Payment Transactions</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Recorded payments history</p>

        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {(invoice.payments || []).length === 0 ? (
            <p className="py-3 text-xs text-slate-400">No payments recorded yet.</p>
          ) : (
            invoice.payments.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-xs">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Payment #{idx + 1}</span>
                  <p className="text-[10px] text-slate-400">
                    via {p.method} &middot; {new Date(p.date).toLocaleString()}
                  </p>
                </div>
                <div className="font-semibold text-emerald-700 dark:text-emerald-400">+${Number(p.amount).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <PaymentForm
          invoice={invoice}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={(updated) => {
            setPaymentModalOpen(false);
            setInvoice(updated);
          }}
        />
      )}
    </div>
  );
};

export default InvoiceDetail;
