import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import dns from "node:dns";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import Expense from "../models/Expense.js";
import RecurringTemplate from "../models/RecurringTemplate.js";
import { calculateInvoiceTotals, calculatePaymentStatus } from "../services/finance.js";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const seedDatabase = async () => {
  try {
    let connected = false;
    for (let i = 0; i < 5 && !connected; i++) {
      try {
        console.log(`Connecting to MongoDB for seeding (attempt ${i + 1})...`);
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 10000,
          maxPoolSize: 5,
          socketTimeoutMS: 45000,
          family: 4,
        });
        connected = true;
      } catch (err) {
        if (i === 4) throw err;
        console.log(`Attempt ${i + 1} failed (${err.message}). Retrying in 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    console.log("Connected to MongoDB.");

    // Clean existing demo user and related data
    const existingAdmin = await User.findOne({ email: "demo@finledger.com" });
    if (existingAdmin) {
      const bizId = existingAdmin.business;
      await Promise.all([
        User.deleteMany({ business: bizId }),
        Customer.deleteMany({ business: bizId }),
        Invoice.deleteMany({ business: bizId }),
        Expense.deleteMany({ business: bizId }),
        RecurringTemplate.deleteMany({ business: bizId }),
      ]);
      console.log("Cleared existing demo business data.");
    }

    // 1. Create Admin & Business
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("secret123", salt);

    const adminId = new mongoose.Types.ObjectId();
    const admin = await User.create({
      _id: adminId,
      name: "Alex Vance",
      email: "demo@finledger.com",
      passwordHash,
      role: "admin",
      business: adminId,
      businessName: "Acme Cloud Services",
    });

    // Create Accountant team member
    await User.create({
      name: "Sarah Chen",
      email: "accountant@finledger.com",
      passwordHash,
      role: "accountant",
      business: adminId,
      businessName: "Acme Cloud Services",
    });

    console.log("Created demo Admin (demo@finledger.com) and Accountant (accountant@finledger.com).");

    // 2. Create 5 Customers
    const customerData = [
      { name: "Apex Technologies", email: "billing@apextech.io", phone: "+1 (555) 019-2831", address: "100 Innovation Way, Suite 400, San Francisco, CA" },
      { name: "BlueSky Logistics", email: "finance@blueskylog.com", phone: "+1 (555) 482-9012", address: "742 Warehouse Blvd, Austin, TX" },
      { name: "Crestview Design Studio", email: "hello@crestview.design", phone: "+1 (555) 321-8899", address: "45 Art District Ave, Brooklyn, NY" },
      { name: "Delta Healthcare Group", email: "accounts@deltahealth.org", phone: "+1 (555) 773-1200", address: "890 Medical Center Parkway, Chicago, IL" },
      { name: "Echo Marketing Labs", email: "invoices@echolabs.agency", phone: "+1 (555) 604-5511", address: "12 Digital Media Dr, Seattle, WA" },
    ];

    const customers = await Customer.insertMany(
      customerData.map((c) => ({ ...c, business: adminId }))
    );
    console.log(`Created ${customers.length} customers.`);

    // 3. Create 2 Recurring Templates
    const template1 = await RecurringTemplate.create({
      business: adminId,
      customer: customers[0]._id,
      items: [
        { description: "Managed Dedicated Cloud Server", quantity: 1, price: 1200 },
        { description: "24/7 Premium SLA Support", quantity: 1, price: 300 },
      ],
      tax: 150,
      frequency: "monthly",
      dueInDays: 15,
      nextRunDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      active: true,
    });

    await RecurringTemplate.create({
      business: adminId,
      customer: customers[2]._id,
      items: [
        { description: "Quarterly Brand Strategy Retainer", quantity: 1, price: 3500 },
      ],
      tax: 0,
      frequency: "quarterly",
      dueInDays: 30,
      nextRunDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: true,
    });
    console.log("Created 2 recurring invoice templates.");

    // 4. Create 15 Invoices (mix of paid, partial, sent, overdue)
    const now = new Date();
    const invoicesData = [
      // Fully Paid invoices in past months (revenue)
      {
        custIndex: 0,
        daysAgoIssue: 90,
        daysAgoDue: 75,
        items: [{ description: "Cloud Infrastructure Setup", quantity: 1, price: 2500 }],
        tax: 200,
        paidFraction: 1.0,
        status: "paid",
        payDaysAgo: 77,
      },
      {
        custIndex: 1,
        daysAgoIssue: 85,
        daysAgoDue: 70,
        items: [{ description: "Logistics API Integration", quantity: 1, price: 1800 }],
        tax: 144,
        paidFraction: 1.0,
        status: "paid",
        payDaysAgo: 72,
      },
      {
        custIndex: 2,
        daysAgoIssue: 60,
        daysAgoDue: 45,
        items: [{ description: "UI/UX Redesign Sprint", quantity: 2, price: 1200 }],
        tax: 0,
        paidFraction: 1.0,
        status: "paid",
        payDaysAgo: 46,
      },
      {
        custIndex: 3,
        daysAgoIssue: 50,
        daysAgoDue: 35,
        items: [{ description: "HIPAA Security Audit", quantity: 1, price: 3200 }],
        tax: 250,
        paidFraction: 1.0,
        status: "paid",
        payDaysAgo: 38,
      },
      {
        custIndex: 4,
        daysAgoIssue: 40,
        daysAgoDue: 25,
        items: [{ description: "Performance Marketing Campaign", quantity: 1, price: 1500 }],
        tax: 120,
        paidFraction: 1.0,
        status: "paid",
        payDaysAgo: 26,
      },
      {
        custIndex: 0,
        daysAgoIssue: 30,
        daysAgoDue: 15,
        items: [{ description: "Cloud Hosting - Month 2", quantity: 1, price: 1500 }],
        tax: 150,
        paidFraction: 1.0,
        status: "paid",
        payDaysAgo: 16,
      },

      // Partial invoices
      {
        custIndex: 1,
        daysAgoIssue: 25,
        daysAgoDue: 10,
        items: [{ description: "Fleet Tracking Dashboard Phase 1", quantity: 1, price: 4000 }],
        tax: 320,
        paidFraction: 0.5,
        status: "partial",
        payDaysAgo: 12,
      },
      {
        custIndex: 3,
        daysAgoIssue: 15,
        daysAgoDue: -15, // due in 15 days
        items: [{ description: "Patient Portal Integration", quantity: 1, price: 2800 }],
        tax: 220,
        paidFraction: 0.4,
        status: "partial",
        payDaysAgo: 5,
      },

      // Overdue invoices (past due date with outstanding balance)
      {
        custIndex: 4,
        daysAgoIssue: 75,
        daysAgoDue: 62, // 62 days overdue -> 61+ bucket
        items: [{ description: "Legacy Ads Migration", quantity: 1, price: 1400 }],
        tax: 0,
        paidFraction: 0,
        status: "overdue",
      },
      {
        custIndex: 2,
        daysAgoIssue: 50,
        daysAgoDue: 38, // 38 days overdue -> 31-60 bucket
        items: [{ description: "Interactive 3D Prototype", quantity: 1, price: 2200 }],
        tax: 176,
        paidFraction: 0,
        status: "overdue",
      },
      {
        custIndex: 0,
        daysAgoIssue: 35,
        daysAgoDue: 18, // 18 days overdue -> 1-30 bucket
        items: [{ description: "Database Optimization Retainer", quantity: 1, price: 950 }],
        tax: 76,
        paidFraction: 0,
        status: "overdue",
      },

      // Sent invoices (open, not overdue yet)
      {
        custIndex: 1,
        daysAgoIssue: 10,
        daysAgoDue: -10, // due in 10 days
        items: [{ description: "Logistics Optimization Modules", quantity: 1, price: 1950 }],
        tax: 150,
        paidFraction: 0,
        status: "sent",
      },
      {
        custIndex: 2,
        daysAgoIssue: 5,
        daysAgoDue: -20, // due in 20 days
        items: [{ description: "Design System Maintenance", quantity: 1, price: 1250 }],
        tax: 0,
        paidFraction: 0,
        status: "sent",
      },
      {
        custIndex: 3,
        daysAgoIssue: 2,
        daysAgoDue: -25, // due in 25 days
        items: [{ description: "Cloud Backup & Disaster Recovery", quantity: 1, price: 1600 }],
        tax: 128,
        paidFraction: 0,
        status: "sent",
      },

      // Draft invoice
      {
        custIndex: 4,
        daysAgoIssue: 1,
        daysAgoDue: -30,
        items: [{ description: "Consulting Discovery Workshop", quantity: 1, price: 800 }],
        tax: 0,
        paidFraction: 0,
        status: "draft",
      },
    ];

    for (let i = 0; i < invoicesData.length; i++) {
      const invInfo = invoicesData[i];
      const invCustomer = customers[invInfo.custIndex];
      const issueDate = new Date(now.getTime() - invInfo.daysAgoIssue * 24 * 60 * 60 * 1000);
      const dueDate = new Date(now.getTime() - invInfo.daysAgoDue * 24 * 60 * 60 * 1000);

      const { subtotal, tax, total } = calculateInvoiceTotals(invInfo.items, invInfo.tax);
      const invoiceNumber = `INV-${String(i + 1).padStart(4, "0")}`;

      const payments = [];
      let amountPaid = 0;

      if (invInfo.paidFraction > 0) {
        amountPaid = Math.round(total * invInfo.paidFraction * 100) / 100;
        const payDate = new Date(now.getTime() - (invInfo.payDaysAgo || 10) * 24 * 60 * 60 * 1000);
        payments.push({
          amount: amountPaid,
          date: payDate,
          method: "Bank Transfer",
        });
      }

      const pStatus = calculatePaymentStatus(total, payments, dueDate, invInfo.status);

      await Invoice.create({
        business: adminId,
        customer: invCustomer._id,
        invoiceNumber,
        issueDate,
        dueDate,
        items: invInfo.items,
        subtotal,
        tax,
        total,
        payments,
        amountPaid: pStatus.amountPaid,
        status: pStatus.status,
        notes: `Thank you for your business with Acme Cloud Services!`,
      });
    }

    console.log("Created 15 sample invoices across paid, partial, sent, overdue, and draft.");

    // 5. Create 20 Expenses across 4 months
    const expenseCategories = ["Rent", "Salaries", "Supplies", "Utilities", "Marketing", "Travel", "Other"];
    const expenseSamples = [
      { title: "WeWork Office Space", amount: 1500, category: "Rent", daysAgo: 105 },
      { title: "Team Payroll - Month 1", amount: 3200, category: "Salaries", daysAgo: 100 },
      { title: "AWS Cloud Infrastructure", amount: 480, category: "Utilities", daysAgo: 95 },
      { title: "Google Workspace & Software Licenses", amount: 150, category: "Supplies", daysAgo: 92 },
      { title: "Google Ads Campaigns", amount: 600, category: "Marketing", daysAgo: 85 },

      { title: "WeWork Office Space", amount: 1500, category: "Rent", daysAgo: 75 },
      { title: "Team Payroll - Month 2", amount: 3200, category: "Salaries", daysAgo: 70 },
      { title: "AWS Cloud Infrastructure", amount: 520, category: "Utilities", daysAgo: 65 },
      { title: "Client Dinner & Networking", amount: 240, category: "Travel", daysAgo: 62 },
      { title: "LinkedIn Sponsored InMail", amount: 450, category: "Marketing", daysAgo: 58 },

      { title: "WeWork Office Space", amount: 1500, category: "Rent", daysAgo: 45 },
      { title: "Team Payroll - Month 3", amount: 3400, category: "Salaries", daysAgo: 40 },
      { title: "AWS Cloud Infrastructure", amount: 590, category: "Utilities", daysAgo: 35 },
      { title: "High-performance Monitors & Ergonomics", amount: 780, category: "Supplies", daysAgo: 32 },
      { title: "Flight to Tech Summit", amount: 510, category: "Travel", daysAgo: 28 },

      { title: "WeWork Office Space", amount: 1500, category: "Rent", daysAgo: 15 },
      { title: "Team Payroll - Month 4", amount: 3400, category: "Salaries", daysAgo: 10 },
      { title: "AWS Cloud Infrastructure", amount: 620, category: "Utilities", daysAgo: 7 },
      { title: "Accountant Legal & Tax Advisory", amount: 400, category: "Other", daysAgo: 4 },
      { title: "SEO Agency Retainer", amount: 750, category: "Marketing", daysAgo: 2 },
    ];

    const expenseDocs = expenseSamples.map((e) => ({
      business: adminId,
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: new Date(now.getTime() - e.daysAgo * 24 * 60 * 60 * 1000),
      notes: "Demo business operating expense",
    }));

    await Expense.insertMany(expenseDocs);
    console.log(`Created ${expenseDocs.length} expenses across 4 months.`);

    console.log("\n=======================================================");
    console.log(" Seeding completed successfully!");
    console.log(" Demo Credentials:");
    console.log(" Admin:      demo@finledger.com      / secret123");
    console.log(" Accountant: accountant@finledger.com / secret123");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();
