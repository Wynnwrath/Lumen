import React, { useState } from "react";
import { Icon } from "../../components/common/Icon";
import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/ToastProvider";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { useThemeStore } from "../../stores/theme.store";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, loginAdmin, logout } = useAuthStore();
  const { toggle } = useThemeStore();
  const { showToast } = useToast();

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // UI state
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [rememberSession, setRememberSession] = useState(false);

  const handleDemoAutofill = () => {
    setLoginEmail("admin@lumen.com");
    setLoginPassword("password123");
    showToast("Demo admin credentials filled!", "info");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!loginEmail || !loginPassword) {
      setAlert({ message: "Please enter your business email and password.", type: "error" });
      return;
    }
    try {
      await loginAdmin(loginEmail, loginPassword);
      showToast("Signed in to Admin Portal!", "success");
      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } catch {
      setAlert({ message: "Invalid admin credentials.", type: "error" });
    }
  };

  return (
    <div className="bg-surface dark:bg-slate-900 text-on-surface dark:text-slate-100 font-['Hanken_Grotesk',sans-serif] antialiased min-h-screen flex flex-col justify-between selection:bg-secondary selection:text-white transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="border-b border-outline-variant/30 bg-surface-container-lowest/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary dark:bg-white text-white dark:text-primary rounded-xl flex items-center justify-center font-black text-lg tracking-tighter shadow-sm group-hover:scale-105 transition duration-200">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-on-surface dark:text-white leading-none">
                LUMEN
              </span>
              <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Admin Portal</span>
            </div>
          </Link>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/"
              className="text-xs font-bold text-outline hover:text-on-surface dark:hover:text-white flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-surface-container dark:hover:bg-slate-800 transition whitespace-nowrap"
              title="Back to Marketplace"
            >
              <Icon name="storefront" className="text-lg" />
              <span className="hidden sm:inline">Back to Marketplace</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="p-2 text-outline hover:text-on-surface dark:hover:text-white rounded-xl hover:bg-surface-container dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              <Icon name="dark_mode" className="text-xl dark:hidden" />
              <Icon name="light_mode" className="text-xl hidden dark:block" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Auth Section */}
      <main className="flex-grow flex items-center justify-center p-3 sm:p-6 md:p-8 my-2 sm:my-6">
        <div className="w-full max-w-5xl bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[640px]">
          {/* Left Hero Banner Column (Dashboard Live Showcase) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-primary to-slate-950 text-white p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
            {/* Background Glow Overlays */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Content Header */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Admin Control Center</span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  Empower Store Operations with Lumen Admin
                </h1>
                <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                  Real-time sales tracking, order processing, inventory control, and customer management.
                </p>
              </div>
            </div>

            {/* Live Dashboard Snapshot Cards */}
            <div className="relative z-10 space-y-3 my-6">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="equalizer" className="text-sm text-blue-400" />
                <span>Live Store Metrics Snapshot</span>
              </div>

              {/* Monthly Volume */}
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/30 flex items-center justify-center shrink-0">
                  <Icon name="payments" className="text-emerald-300 text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-300 font-medium">Monthly Gross Volume</div>
                  <div className="text-sm font-extrabold text-white flex items-center justify-between">
                    <span>$142,850.00</span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">+18.4%</span>
                  </div>
                </div>
              </div>

              {/* Active Orders */}
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/30 flex items-center justify-center shrink-0">
                  <Icon name="inventory_2" className="text-blue-300 text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-slate-300 font-medium">Active Store Orders</div>
                  <div className="text-sm font-extrabold text-white flex items-center justify-between">
                    <span>14,290 Orders</span>
                    <span className="text-[11px] font-bold text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded">99.8% On-Time</span>
                  </div>
                </div>
              </div>

              {/* Live Real-time Activity Stream */}
              <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Recent Activity Feed</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon name="check_circle" className="text-xs text-emerald-400" />
                      <span>Order #8492 Processed ($249.00)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">2m ago</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon name="person_add" className="text-xs text-blue-400" />
                      <span>New Customer Registered</span>
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">12m ago</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon name="inventory" className="text-xs text-amber-400" />
                      <span>Inventory Restocked (+50)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">45m ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Lumen Store Management</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Icon name="shield" className="text-xs" /> Restricted Portal
              </span>
            </div>
          </div>

          {/* Right Auth Form Column */}
          <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Mobile Compact Header Greeting */}
              <div className="lg:hidden mb-5 text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Admin Control Center</span>
                </div>
                <h1 className="text-xl font-extrabold text-on-surface dark:text-white">
                  Admin Portal
                </h1>
                <p className="text-xs text-outline font-medium">
                  Sign in to manage inventory & store operations
                </p>
              </div>

              {/* Alert Box Container */}
              {alert && (
                <div
                  className={`mb-6 p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                    alert.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon name={alert.type === "success" ? "check_circle" : "error"} className="text-lg" />
                    <span>{alert.message}</span>
                  </div>
                  <button onClick={() => setAlert(null)} className="text-outline hover:text-primary">
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>
              )}

              {/* Active Session Notice */}
              {user && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Icon name="account_circle" className="text-base text-secondary" />
                      <span>
                        Active Session: <strong>{user.name}</strong>
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5 truncate">
                      Logged in as <span>{user.email}</span> (<span className="uppercase">{user.role || "ADMIN"}</span>)
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      showToast("Session ended", "info");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0"
                  >
                    Switch Account
                  </button>
                </div>
              )}

              {/* LOGIN FORM */}
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-on-surface dark:text-white">Admin Sign In</h2>
                  <p className="text-xs text-outline font-medium mt-1">
                    Access your store dashboard, manage products, and view real-time metrics.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email input */}
                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="block text-xs font-bold text-on-surface dark:text-slate-200">
                      Business Email
                    </label>
                    <div className="relative">
                      <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="admin@lumen.com"
                        className="w-full bg-surface dark:bg-slate-900 text-on-surface dark:text-white border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
                      />
                    </div>
                  </div>

                  {/* Password input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="block text-xs font-bold text-on-surface dark:text-slate-200">
                        Password
                      </label>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          showToast("Password reset instructions sent to email", "info");
                        }}
                        className="text-xs font-bold text-secondary hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-surface dark:bg-slate-900 text-on-surface dark:text-white border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
                      />
                    </div>
                  </div>

                  {/* Checkbox & Submit */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-outline font-medium">
                      <input
                        type="checkbox"
                        checked={rememberSession}
                        onChange={(e) => setRememberSession(e.target.checked)}
                        className="rounded border-outline-variant text-secondary focus:ring-secondary accent-secondary"
                      />
                      <span>Remember session for 30 days</span>
                    </label>
                  </div>

                  <Button type="submit" icon="login" fullWidth>
                    Sign In to Admin Portal
                  </Button>
                </form>

                {/* Quick Demo Fill Helper */}
                <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                  <span className="text-outline font-medium">Testing as Demo Admin?</span>
                  <button
                    type="button"
                    onClick={handleDemoAutofill}
                    className="text-secondary font-bold hover:underline flex items-center gap-1"
                  >
                    <Icon name="auto_fix_high" className="text-sm" />
                    <span>Fill Demo Admin Credentials</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Form Bottom Links */}
            <div className="pt-6 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs text-outline font-medium">
              <span>
                Need help?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast("Admin support line active 24/7", "info");
                  }}
                  className="text-secondary font-bold hover:underline"
                >
                  Contact Admin Support
                </a>
              </span>
              <span className="flex items-center gap-1">
                <Icon name="lock" className="text-sm text-emerald-500" /> 256-bit SSL Encrypted
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 bg-surface-container-lowest dark:bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-outline font-medium">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-on-surface dark:text-white">LUMEN</span>
            <span>&copy; 2026 Lumen E-Commerce Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface dark:hover:text-white transition">
              Admin Policy
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface dark:hover:text-white transition">
              Security Standard
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface dark:hover:text-white transition">
              API Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
