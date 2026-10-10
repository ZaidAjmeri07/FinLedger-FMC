import cron from "node-cron";
import { processRecurringTemplates } from "../services/recurring.js";

/**
 * Initializes cron jobs for FinLedger
 */
export const initScheduler = () => {
  // Run once immediately on server boot (helpful for sleeping hosts like Render)
  setTimeout(async () => {
    try {
      console.log("[Scheduler] Running initial recurring invoices check...");
      const result = await processRecurringTemplates();
      console.log(`[Scheduler] Initial check complete: ${result.generatedInvoices} invoice(s) generated.`);
    } catch (err) {
      console.error("[Scheduler] Error running initial recurring check:", err.message);
    }
  }, 5000);

  // Daily cron job at midnight (00:00:00)
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("[Scheduler] Running daily scheduled recurring invoices check...");
      const result = await processRecurringTemplates();
      console.log(`[Scheduler] Daily check complete: ${result.generatedInvoices} invoice(s) generated.`);
    } catch (err) {
      console.error("[Scheduler] Error in daily recurring cron job:", err.message);
    }
  });

  console.log("[Scheduler] Recurring invoice scheduler registered.");
};
