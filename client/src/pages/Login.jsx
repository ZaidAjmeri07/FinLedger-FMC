import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 503) {
        setError(
          err.response.data?.message ||
            "Database is currently unreachable. Make sure your IP is whitelisted in MongoDB Atlas Network Access."
        );
      } else {
        setError(err.response?.data?.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role = "admin") => {
    if (role === "admin") {
      setEmail("demo@finledger.com");
      setPassword("secret123");
    } else {
      setEmail("accountant@finledger.com");
      setPassword("secret123");
    }
    setError("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Theme toggle button in top right */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
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
      </div>

      <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 dark:bg-slate-100 text-xs font-bold text-white dark:text-slate-900">
              FL
            </div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">FinLedger</h1>
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Sign in</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enter your credentials to access your business account</p>
        </div>

        {error && (
          <div className="mb-5 rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs leading-relaxed text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="mt-1.5 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-800 dark:focus:border-slate-300 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 dark:bg-slate-100 py-2 text-xs font-medium text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Demo Credentials
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("admin")}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("accountant")}
              className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Accountant Demo
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
