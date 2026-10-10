/**
 * Financial Calculation & Reporting Service for FinLedger
 */

/**
 * Calculates subtotal, tax, and total from line items and tax amount/rate
 */
export const calculateInvoiceTotals = (items = [], tax = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    return sum + qty * price;
  }, 0);

  const numTax = Number(tax) || 0;
  const total = Math.max(0, subtotal + numTax);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(numTax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

/**
 * Calculates total paid amount, remaining balance, and resolved status
 */
export const calculatePaymentStatus = (total, payments = [], dueDate = null, currentStatus = "draft") => {
  const amountPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balance = Math.max(0, Math.round((total - amountPaid) * 100) / 100);

  let status = currentStatus;
  const isPastDue = dueDate && new Date(dueDate) < new Date();

  if (balance <= 0 && total > 0) {
    status = "paid";
  } else if (amountPaid > 0) {
    status = isPastDue ? "overdue" : "partial";
  } else if (isPastDue && currentStatus !== "draft") {
    status = "overdue";
  }

  return {
    amountPaid: Math.round(amountPaid * 100) / 100,
    balance,
    status,
  };
};

/**
 * Calculates overdue receivables and assigns to aging buckets (1-30, 31-60, 61+)
 */
export const calculateAgingBuckets = (invoices = []) => {
  const now = new Date();
  const buckets = {
    "1-30": { range: "1-30 days", total: 0, count: 0 },
    "31-60": { range: "31-60 days", total: 0, count: 0 },
    "61+": { range: "61+ days", total: 0, count: 0 },
  };

  const overdueList = [];

  for (const inv of invoices) {
    const amountPaid = (inv.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const balance = Math.max(0, Math.round(((inv.total || 0) - amountPaid) * 100) / 100);

    if (balance > 0 && inv.dueDate && new Date(inv.dueDate) < now) {
      const diffTime = now - new Date(inv.dueDate);
      const daysOverdue = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      let bucketKey = "1-30";
      if (daysOverdue > 60) {
        bucketKey = "61+";
      } else if (daysOverdue > 30) {
        bucketKey = "31-60";
      }

      buckets[bucketKey].total = Math.round((buckets[bucketKey].total + balance) * 100) / 100;
      buckets[bucketKey].count += 1;

      overdueList.push({
        _id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        customer: inv.customer,
        dueDate: inv.dueDate,
        total: inv.total,
        amountPaid,
        balance,
        daysOverdue,
        bucket: bucketKey,
      });
    }
  }

  // Sort by highest days overdue
  overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue);

  const totalOverdue = Math.round(
    (buckets["1-30"].total + buckets["31-60"].total + buckets["61+"].total) * 100
  ) / 100;

  return {
    buckets,
    totalOverdue,
    overdueList,
  };
};

/**
 * Calculates monthly cash flow trends (money in vs out) and expected inflows
 */
export const calculateCashFlow = (invoices = [], expenses = [], monthsBack = 6) => {
  const now = new Date();
  const monthMap = new Map();

  // Initialize last N months
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthMap.set(key, { month: label, key, in: 0, out: 0, net: 0, runningBalance: 0 });
  }

  // Aggregate Money In from payments
  for (const inv of invoices) {
    for (const p of inv.payments || []) {
      if (p.date) {
        const d = new Date(p.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthMap.has(key)) {
          const entry = monthMap.get(key);
          entry.in += Number(p.amount) || 0;
        }
      }
    }
  }

  // Aggregate Money Out from expenses
  for (const exp of expenses) {
    if (exp.date) {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap.has(key)) {
        const entry = monthMap.get(key);
        entry.out += Number(exp.amount) || 0;
      }
    }
  }

  // Calculate net and running balance
  let cumulative = 0;
  const history = Array.from(monthMap.values()).map((item) => {
    item.in = Math.round(item.in * 100) / 100;
    item.out = Math.round(item.out * 100) / 100;
    item.net = Math.round((item.in - item.out) * 100) / 100;
    cumulative += item.net;
    item.runningBalance = Math.round(cumulative * 100) / 100;
    return item;
  });

  // Calculate expected inflows (open invoices due in next 30 days)
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  let expectedInflowsNext30Days = 0;

  for (const inv of invoices) {
    const amountPaid = (inv.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const balance = Math.max(0, Math.round(((inv.total || 0) - amountPaid) * 100) / 100);

    if (balance > 0 && inv.dueDate) {
      const due = new Date(inv.dueDate);
      if (due >= now && due <= thirtyDaysOut) {
        expectedInflowsNext30Days += balance;
      }
    }
  }

  return {
    history,
    expectedInflowsNext30Days: Math.round(expectedInflowsNext30Days * 100) / 100,
  };
};
