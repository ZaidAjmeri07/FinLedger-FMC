# FinLedger

> A centralized financial operations system for small businesses: invoices, expenses, customers, payments, cash flow, and reporting. It automates recurring invoices and flags overdue receivables to improve cash-flow visibility.

## 1. Project Explanation (for the mentor)

A business owner registers and manages customers, creates invoices with line items, and records payments against them. Recurring invoices are generated automatically on a schedule. The system identifies overdue receivables with aging buckets and shows cash flow (money in vs money out) on a dashboard. Invoices can be downloaded as PDF. The owner can add team members with limited permissions (role-based access). The project is containerised with Docker and has a CI pipeline on GitHub Actions.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React.js (Vite), React Router, Tailwind CSS, Axios, Recharts |
| Backend | Node.js, Express.js (REST API) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + role-based access control (admin, accountant), bcrypt |
| Automation | node-cron (recurring invoices) |
| PDF | PDFKit |
| DevOps | Docker, docker-compose, GitHub Actions (CI) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

**Future work (described, not built):** Razorpay/Stripe payments, AWS ECS/S3/CloudFront, Prometheus/Grafana monitoring, email delivery.

## 3. Architecture

```
React (Vite + Tailwind + Recharts)
        |  Axios, JWT in Authorization header
        v
Express REST API  ---> MongoDB Atlas (Mongoose)
   |   |
   |   +-- node-cron job (daily: generate recurring invoices)
   +------ PDFKit (invoice PDFs, streamed)
```

**Multi-tenancy:** every record has a `business` field. Every query filters by `req.user.business`, so one business never sees another's data. The user who registers becomes the `admin` and their `_id` becomes the business id.

## 4. Scope (tiers)

**Tier 1 - must build**
- Register / login / logout
- Customers CRUD
- Invoices: line items, auto invoice number, due date, status
- Payments against invoices (full or partial)
- Expenses CRUD with categories
- Dashboard: summary cards, monthly revenue vs expenses chart
- Overdue receivables list with aging buckets
- Cash-flow view (monthly in vs out, plus expected inflows)
- Recurring invoices with scheduled generation and a "Run now" button

**Tier 2 - build if Tier 1 is done**
- PDF invoice download (PDFKit)
- RBAC: admin and accountant roles, team management
- Dockerfiles + docker-compose
- GitHub Actions CI workflow

**Tier 3 - future work**
- Payment gateway (Razorpay/Stripe, test mode first)
- AWS deployment (ECS, S3, CloudFront), Nginx reverse proxy
- Prometheus + Grafana monitoring
- Email reminders for overdue invoices

## 5. User Flow

```
Register / Login
   -> Dashboard (revenue, expenses, profit, outstanding, overdue, cash-flow chart)
   -> Customers       -> add customer
   -> Invoices        -> new invoice -> record payment -> status updates -> download PDF
   -> Recurring       -> create template (customer, items, frequency, next run) -> auto-generates invoices
   -> Expenses        -> add expense
   -> Receivables     -> overdue list with aging buckets
   -> Reports         -> cash flow, expenses by category
   -> Team (admin)    -> add accountant
```

## 6. Frontend Pages

| Page | Path | Access |
|---|---|---|
| Login / Register | `/login`, `/register` | public |
| Dashboard | `/` | all |
| Customers | `/customers` | all |
| Invoices list | `/invoices` | all |
| New / edit invoice | `/invoices/new`, `/invoices/:id/edit` | all |
| Invoice detail + payments + PDF | `/invoices/:id` | all |
| Recurring invoices | `/recurring` | all |
| Expenses | `/expenses` | all |
| Receivables (overdue) | `/receivables` | all |
| Reports / cash flow | `/reports` | all |
| Team | `/team` | admin only |

## 7. Roles (RBAC)

| Action | Admin | Accountant |
|---|---|---|
| Create / edit customers, invoices, expenses, payments | yes | yes |
| Create / edit recurring templates | yes | yes |
| Delete anything | yes | no |
| View dashboard and reports | yes | yes |
| Manage team members | yes | no |

Implemented as middleware: `requireRole("admin")`.

## 8. Backend API

```
POST   /api/auth/register                  creates business + admin
POST   /api/auth/login
GET    /api/auth/me

GET    /api/team                           admin
POST   /api/team                           admin: add accountant
DELETE /api/team/:id                       admin

GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id                  admin

GET    /api/invoices?status=&customer=
POST   /api/invoices
GET    /api/invoices/:id
PUT    /api/invoices/:id
DELETE /api/invoices/:id                   admin
POST   /api/invoices/:id/payments          body: { amount, date, method }
GET    /api/invoices/:id/pdf               streams PDF

GET    /api/recurring
POST   /api/recurring
PUT    /api/recurring/:id                  includes pause / resume
DELETE /api/recurring/:id                  admin
POST   /api/recurring/run-now              generate all due invoices now

GET    /api/expenses?category=&from=&to=
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id                   admin

GET    /api/dashboard/summary
GET    /api/dashboard/cashflow             monthly in vs out
GET    /api/receivables/overdue            list + aging buckets
GET    /api/reports/expenses-by-category
```

## 9. Data Model

**User**: `name`, `email`, `passwordHash`, `role` (admin | accountant), `business` (ObjectId), `businessName`

**Customer**: `business`, `name`, `email`, `phone`, `address`

**Invoice**
```
business, customer (ref), invoiceNumber (INV-0001...),
issueDate, dueDate,
items: [{ description, quantity, price }],
subtotal, tax, total,
payments: [{ amount, date, method }],
amountPaid, status (draft | sent | partial | paid | overdue),
recurringSource (ref, optional), notes
```

**RecurringTemplate**
```
business, customer (ref),
items: [{ description, quantity, price }], tax,
frequency (weekly | monthly | quarterly | yearly),
dueInDays (e.g. 15),
nextRunDate, lastRunAt, active
```

**Expense**: `business`, `title`, `amount`, `category` (Rent, Salaries, Supplies, Utilities, Marketing, Travel, Other), `date`, `notes`

Payments are embedded in the invoice to keep queries simple.

## 10. Business Rules

**Invoices and payments**
- Line total = quantity x price; subtotal = sum; total = subtotal + tax
- amountPaid = sum of payments; balance = total - amountPaid
- After a payment: `paid` if balance is 0, `partial` if some paid
- Reject payments larger than the balance
- Invoice number = next number for that business, zero-padded

**Overdue receivables**
- Overdue = due date passed and balance > 0 (computed on read, no cron needed)
- Days overdue = today - due date
- Aging buckets: 1-30 days, 31-60 days, 61+ days, with the total balance in each

**Cash flow**
- Money in = payments received per month
- Money out = expenses per month
- Net = in - out; running balance = cumulative net
- Expected inflows (next 30 days) = balances of open invoices due in that window

**Recurring invoices**
- A daily cron job (and the "Run now" button) finds active templates where `nextRunDate <= today`
- For each, create an invoice (status `sent`, `dueDate = today + dueInDays`, `recurringSource = template id`)
- Advance `nextRunDate` by the frequency; repeat until it is in the future (cap at a few iterations to avoid runaway loops)
- Set `lastRunAt`
- Also run the check once on server start, because free hosts (e.g. Render) may sleep and miss the schedule

**Dashboard**
- Revenue = sum of payments in the period (cash basis)
- Profit = revenue - expenses
- Outstanding = sum of balances on unpaid invoices
- Overdue = outstanding portion past due date

All of this lives in `server/src/services/finance.js` and `server/src/services/recurring.js`.

## 11. PDF Invoice (PDFKit)

`GET /api/invoices/:id/pdf` builds a PDF with business name, invoice number, dates, customer details, an items table, subtotal / tax / total, amount paid, and balance. It is streamed with `Content-Type: application/pdf`. The frontend downloads it with a "Download PDF" button (Axios with `responseType: "blob"`, since the JWT header is needed).

## 12. Folder Structure

```
finledger/
├── server/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/ (User, Customer, Invoice, RecurringTemplate, Expense).js
│   │   ├── routes/ (auth, team, customers, invoices, recurring, expenses,
│   │   │            dashboard, receivables, reports).js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── auth.js               verifies JWT -> req.user
│   │   │   └── roles.js              requireRole()
│   │   ├── services/
│   │   │   ├── finance.js            totals, status, cash flow, aging
│   │   │   ├── recurring.js          generate due invoices
│   │   │   └── pdf.js                PDFKit invoice builder
│   │   ├── jobs/scheduler.js         node-cron setup
│   │   ├── seed/seed.js              demo business with sample data
│   │   └── app.js
│   ├── Dockerfile
│   ├── .env
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx  Sidebar.jsx  ProtectedRoute.jsx  RoleGate.jsx
│   │   │   ├── StatCard.jsx  StatusBadge.jsx
│   │   │   ├── InvoiceForm.jsx  PaymentForm.jsx  ExpenseForm.jsx  RecurringForm.jsx
│   │   │   └── charts/ (CashflowChart.jsx, CategoryPie.jsx, AgingBars.jsx)
│   │   ├── pages/
│   │   │   ├── Login  Register  Dashboard  Customers
│   │   │   ├── Invoices  InvoiceEditor  InvoiceDetail
│   │   │   ├── Recurring  Expenses  Receivables  Reports  Team
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 13. Environment Variables

`server/.env`
```
PORT=5000
MONGO_URI=your_atlas_connection_string
JWT_SECRET=a_long_random_string
CLIENT_URL=http://localhost:5173
```

`client/.env`
```
VITE_API_URL=http://localhost:5000/api
```

Add `.env` and `node_modules` to `.gitignore`.

## 14. Setup

```bash
mkdir finledger && cd finledger

mkdir server && cd server
npm init -y
npm i express mongoose dotenv bcrypt jsonwebtoken cors node-cron pdfkit
npm i -D nodemon
cd ..

npm create vite@latest client -- --template react
cd client
npm i
npm i axios react-router-dom recharts
npm i tailwindcss @tailwindcss/vite
```

Server `package.json`: add `"type": "module"` and scripts `start`, `dev` (nodemon), `seed`.

## 15. Docker and CI (Tier 2)

**docker-compose.yml** runs three services: `mongo` (official image), `server` (built from `server/Dockerfile`, env from `.env`), and `client` (multi-stage build, static files served by a small nginx container).

**CI workflow** (`.github/workflows/ci.yml`), on every push and pull request:
1. Check out code
2. Set up Node
3. `npm ci` and `npm run build` in `client`
4. `npm ci` in `server` (and run tests if any)

## 16. Seed Data

`npm run seed` creates a demo business with an admin user, 5 customers, 15 invoices (mix of paid, partial, sent, overdue), 20 expenses across 4 months, and 2 recurring templates. This makes the dashboard and charts look good in the demo.

## 17. Build Order

1. Server setup: Express, MongoDB, `.env`
2. Auth (register creates business + admin, login, middleware)
3. Customers CRUD
4. Invoices + finance service
5. Payments + status updates
6. Expenses CRUD
7. Dashboard summary + cash-flow chart
8. Overdue receivables + aging
9. Recurring templates + scheduler + "Run now"
10. Seed data
11. PDF download
12. RBAC + Team page
13. Docker + GitHub Actions
14. Polish, README, deploy

**Rule:** get one flow working end to end first: add customer -> create invoice -> record payment -> see it on the dashboard. If a step takes more than 2 hours, simplify it.

