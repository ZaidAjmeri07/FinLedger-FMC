import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 dark:bg-slate-100 text-xs font-bold text-white dark:text-slate-900">
          FL
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            {user?.businessName || "FinLedger Operations"}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Financial Operations Console</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} theme`}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

        {/* User Info & Role */}
        <div className="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 py-1 pl-2.5 pr-3 text-xs">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{user?.name}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              user?.role === "admin"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            }`}
          >
            {user?.role === "admin" ? "Admin" : "Accountant"}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          id="logout-btn"
          onClick={logout}
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title="Sign out"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Navbar;
