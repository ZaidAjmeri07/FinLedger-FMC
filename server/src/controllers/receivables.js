import Invoice from "../models/Invoice.js";
import { calculateAgingBuckets } from "../services/finance.js";

export const getOverdueReceivables = async (req, res) => {
  try {
    const businessId = req.user.business;

    const invoices = await Invoice.find({ business: businessId })
      .populate("customer", "name email phone")
      .sort({ dueDate: 1 });

    const { buckets, totalOverdue, overdueList } = calculateAgingBuckets(invoices);

    res.json({
      buckets,
      totalOverdue,
      count: overdueList.length,
      overdueList,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch overdue receivables", error: err.message });
  }
};
