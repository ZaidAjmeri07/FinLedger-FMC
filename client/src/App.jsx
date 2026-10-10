import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import InvoiceEditor from "./pages/InvoiceEditor";
import InvoiceDetail from "./pages/InvoiceDetail";
import Recurring from "./pages/Recurring";
import Expenses from "./pages/Expenses";
import Inventory from "./pages/Inventory";
import Receivables from "./pages/Receivables";
import Reports from "./pages/Reports";
import Team from "./pages/Team";

// App Layout Shell
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/invoices/new" element={<InvoiceEditor />} />
                <Route path="/invoices/:id" element={<InvoiceDetail />} />
                <Route path="/invoices/:id/edit" element={<InvoiceEditor />} />
                <Route path="/recurring" element={<Recurring />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route
                  path="/inventory"
                  element={
                    <RoleGate role="admin" fallback={<Navigate to="/" replace />}>
                      <Inventory />
                    </RoleGate>
                  }
                />
                <Route path="/receivables" element={<Receivables />} />
                <Route path="/reports" element={<Reports />} />
                <Route
                  path="/team"
                  element={
                    <RoleGate role="admin" fallback={<Navigate to="/" replace />}>
                      <Team />
                    </RoleGate>
                  }
                />
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
