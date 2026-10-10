import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import InvoiceForm from "../components/InvoiceForm";

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      const fetchInvoice = async () => {
        try {
          const { data } = await api.get(`/invoices/${id}`);
          setInvoice(data);
        } catch (err) {
          setError("Failed to load invoice for editing.");
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center text-xs text-slate-500">
        Loading invoice editor...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-1.5 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Invoices</span>
        </button>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {id ? `Edit Invoice ${invoice?.invoiceNumber || ""}` : "Create Invoice"}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set up billable line items, select client, and define payment due date
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-2.5 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <InvoiceForm
          initialData={invoice}
          onSuccess={(saved) => navigate(`/invoices/${saved._id}`)}
          onCancel={() => navigate("/invoices")}
        />
      </div>
    </div>
  );
};

export default InvoiceEditor;
