import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useThemeStore } from "../stores/theme.store";
import { getApiError } from "../api/client";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import { PasswordInput } from "../components/ui/PasswordInput";
import { useToast } from "../components/ui/ToastProvider";
import { isValidPhone, PHONE_PATTERN } from "../utils/validation";
import { FREE_SHIPPING_MIN } from "../constants";
import { formatMoney } from "../utils/format";
import logo from "../assets/logo.png";

const getPasswordChecks = (password: string) => [
  { ok: password.length >= 8, msg: "at least 8 characters" },
  { ok: /[A-Z]/.test(password), msg: "an uppercase letter" },
  { ok: /[a-z]/.test(password), msg: "a lowercase letter" },
  { ok: /[0-9]/.test(password), msg: "a number" },
  { ok: /[^A-Za-z0-9]/.test(password), msg: "a special character" },
];

// Customer login/register page with a live password-strength checklist.
export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, register, logout } = useAuthStore();
  const { toggle } = useThemeStore();
  const { showToast } = useToast();

  // Where to send the user after auth (e.g. back to /checkout). Only accept
  // internal paths so a crafted "redirect" can't bounce users off-site.
  const rawRedirect = searchParams.get("redirect");
  const redirectTo = rawRedirect && rawRedirect.startsWith("/") ? rawRedirect : "/";

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form states - Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPhoneError, setRegPhoneError] = useState("");
  const [regTerms, setRegTerms] = useState(false);

  // UI state
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [subscribePromo, setSubscribePromo] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!loginEmail || !loginPassword) {
      setAlert({ message: "Please fill in email and password.", type: "error" });
      return;
    }
    try {
      await login(loginEmail, loginPassword);
      showToast("Signed in successfully!", "success");
      setTimeout(() => {
        navigate(redirectTo);
      }, 500);
    } catch {
      setAlert({ message: "Invalid email or password.", type: "error" });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!regTerms) {
      setAlert({ message: "You must agree to the Terms of Service to register.", type: "error" });
      return;
    }
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setAlert({ message: "Please fill in all required fields.", type: "error" });
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAlert({ message: "Passwords do not match.", type: "error" });
      return;
    }
    const failed = getPasswordChecks(regPassword).find((c) => !c.ok);
    if (failed) {
      setAlert({ message: `Password must include ${failed.msg}.`, type: "error" });
      return;
    }
    if (regPhone && !isValidPhone(regPhone)) {
      setAlert({ message: "Please enter a valid phone number.", type: "error" });
      setRegPhoneError("Enter a valid phone number (e.g. +63928869230)");
      return;
    }
    try {
      await register({ name: regName, email: regEmail, password: regPassword, phone: regPhone });
      setAlert({ message: "Customer account created successfully! Welcome to Lumen.", type: "success" });
      showToast("Welcome to Lumen Member Rewards!", "success");
      setTimeout(() => {
        navigate(redirectTo);
      }, 1000);
    } catch (error) {
      const { message: serverMsg, details } = getApiError(error);
      const passwordDetails = (details as { password?: string[] } | undefined)?.password;
      if (passwordDetails?.length) {
        setAlert({ message: passwordDetails[0] ?? "Registration failed. Please try again.", type: "error" });
      } else {
        setAlert({ message: serverMsg || "Registration failed. Please try again.", type: "error" });
      }
    }
  };

  return (
    <div className="bg-surface dark:bg-slate-900 text-on-surface dark:text-slate-100 font-['Hanken_Grotesk',sans-serif] antialiased min-h-screen flex flex-col justify-between selection:bg-secondary selection:text-white transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="border-b border-outline-variant/30 bg-surface-container-lowest/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logo}
              alt="Lumen logo"
              className="w-9 h-9 object-contain rounded-xl shadow-sm group-hover:scale-105 transition duration-200"
            />
            <span className="font-extrabold text-xl tracking-tight text-on-surface dark:text-white">LUMEN</span>
          </Link>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/"
              className="text-xs font-bold text-outline hover:text-on-surface dark:hover:text-white flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-surface-container dark:hover:bg-slate-800 transition whitespace-nowrap"
              title="Back to Shop"
            >
              <Icon name="shopping_bag" className="text-lg" />
              <span className="hidden sm:inline">Back to Shop</span>
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

      {/* Main Customer Auth Section */}
      <main className="flex-grow flex items-center justify-center p-3 sm:p-6 md:p-8 my-2 sm:my-6">
        <div className="w-full max-w-5xl bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[650px]">
          {/* Left Hero Banner Column (Lifestyle Showcase) - Shown on desktop */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-900 via-primary to-slate-950 text-white p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
            {/* Background Glow Overlays */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Content */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-200">
                <Icon name="verified" className="text-sm text-amber-300" />
                <span>Lumen Member Rewards</span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
                  Elevate Your Everyday Tech Shopping
                </h1>
                <p className="mt-3 text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                  Sign in to unlock personalized product recommendations, express checkout, live order tracking, and exclusive member discounts.
                </p>
              </div>
            </div>

            {/* Member Perks Feature List */}
            <div className="relative z-10 space-y-3.5 my-8">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="w-9 h-9 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0">
                  <Icon name="local_shipping" className="text-blue-300 text-lg" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Free Express Shipping</div>
                  <div className="text-[11px] text-slate-300">On all eligible member orders above {formatMoney(FREE_SHIPPING_MIN)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/30 flex items-center justify-center shrink-0">
                  <Icon name="loyalty" className="text-emerald-300 text-lg" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Earn Member Points</div>
                  <div className="text-[11px] text-slate-300">Get 5% back in reward credits on every order</div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Join over 50,000+ Happy Shoppers</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Icon name="shield" className="text-xs" /> 100% Secure
              </span>
            </div>
          </div>

          {/* Right Auth Form Column */}
          <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[580px] lg:min-h-[650px]">
            <div>
              {/* Mobile Compact Header Greeting */}
              <div className="lg:hidden mb-5 text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold mb-1">
                  <Icon name="verified" className="text-sm" />
                  <span>Lumen Member Rewards</span>
                </div>
                <h1 className="text-xl font-extrabold text-on-surface dark:text-white">
                  {activeTab === "login" ? "Welcome Back to Lumen" : "Join Lumen Rewards"}
                </h1>
                <p className="text-xs text-outline font-medium">
                  {activeTab === "login"
                    ? "Sign in to access your orders & member perks"
                    : "Create an account for express checkout & rewards"}
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center bg-surface-container dark:bg-slate-700/60 p-1 rounded-xl border border-outline-variant/30 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setAlert(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-center ${
                    activeTab === "login"
                      ? "bg-surface-container-lowest dark:bg-slate-800 text-primary dark:text-white shadow-sm"
                      : "text-outline hover:text-on-surface dark:hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setAlert(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all text-center ${
                    activeTab === "register"
                      ? "bg-surface-container-lowest dark:bg-slate-800 text-primary dark:text-white shadow-sm"
                      : "text-outline hover:text-on-surface dark:hover:text-white"
                  }`}
                >
                  Create Customer Account
                </button>
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
                        Active Customer: <strong>{user.name}</strong>
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5 truncate">
                      Signed in as <span>{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      showToast("Signed out successfully", "info");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0"
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* CUSTOMER LOGIN FORM */}
              {activeTab === "login" && (
                <div className="space-y-4 min-h-[420px] flex flex-col justify-between">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="login-email" className="block text-xs font-bold text-on-surface dark:text-slate-200">
                        Email Address
                      </label>
                      <div className="relative">
                        <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
                        <input
                          id="login-email"
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="alex.morgan@lumen.com"
                          className="w-full bg-surface dark:bg-slate-900 text-on-surface dark:text-white border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <PasswordInput
                      id="login-password"
                      label="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      rightAction={
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            showToast("Password reset link sent to email", "info");
                          }}
                          className="text-xs font-bold text-secondary hover:underline"
                        >
                          Forgot password?
                        </a>
                      }
                    />

                    {/* Checkbox & Submit */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-outline font-medium">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-outline-variant text-secondary focus:ring-secondary accent-secondary"
                        />
                        <span>Remember me on this device</span>
                      </label>
                    </div>

                    <Button type="submit" icon="login" fullWidth>
                      Sign In to Customer Account
                    </Button>
                  </form>
                </div>
              )}

              {/* CUSTOMER REGISTER FORM */}
              {activeTab === "register" && (
                <div className="space-y-4 min-h-[420px] flex flex-col justify-between">
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="reg-name" className="block text-xs font-bold text-on-surface dark:text-slate-200">
                        Full Name
                      </label>
                      <div className="relative">
                        <Icon name="person" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
                        <input
                          id="reg-name"
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full bg-surface dark:bg-slate-900 text-on-surface dark:text-white border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="reg-email" className="block text-xs font-bold text-on-surface dark:text-slate-200">
                        Email Address
                      </label>
                      <div className="relative">
                        <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
                        <input
                          id="reg-email"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className="w-full bg-surface dark:bg-slate-900 text-on-surface dark:text-white border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
                        />
                      </div>
                    </div>

                    {/* Password & Confirm Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PasswordInput
                        id="reg-password"
                        label="Password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 chars"
                      />

                      <PasswordInput
                        id="reg-confirm-password"
                        label="Confirm Password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                      />
                    </div>

                    {/* Live password requirements */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {getPasswordChecks(regPassword).map((c) => (
                        <li
                          key={c.msg}
                          className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                            c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-outline"
                          }`}
                        >
                          <Icon name="check_circle" className={`text-sm ${c.ok ? "" : "opacity-40"}`} />
                          {c.msg}
                        </li>
                      ))}
                    </ul>

                    {/* Phone (optional) */}
                    <div className="space-y-1.5">
                      <label htmlFor="reg-phone" className="block text-xs font-bold text-on-surface dark:text-slate-200">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Icon name="call" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
                        <input
                          id="reg-phone"
                          type="tel"
                          value={regPhone}
                          onChange={(e) => {
                            setRegPhone(e.target.value);
                            if (regPhoneError) setRegPhoneError("");
                          }}
                          placeholder="+63928869230"
                          pattern={PHONE_PATTERN}
                          className={`w-full bg-surface dark:bg-slate-900 text-on-surface dark:text-white border rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition ${
                            regPhoneError ? "border-error focus:border-error focus:ring-error/20" : "border-outline-variant/60"
                          }`}
                        />
                      </div>
                      {regPhoneError && <p className="text-[10px] font-bold text-error">{regPhoneError}</p>}
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-1 space-y-2">
                      <label className="flex items-start gap-2 cursor-pointer text-xs text-outline font-medium">
                        <input
                          id="reg-terms"
                          type="checkbox"
                          required
                          checked={regTerms}
                          onChange={(e) => setRegTerms(e.target.checked)}
                          className="mt-0.5 rounded border-outline-variant text-secondary focus:ring-secondary accent-secondary"
                        />
                        <span>
                          I agree to the{" "}
                          <a href="#" onClick={(e) => e.preventDefault()} className="text-secondary font-bold hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" onClick={(e) => e.preventDefault()} className="text-secondary font-bold hover:underline">
                            Privacy Policy
                          </a>
                          .
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-outline font-medium">
                        <input
                          type="checkbox"
                          checked={subscribePromo}
                          onChange={(e) => setSubscribePromo(e.target.checked)}
                          className="rounded border-outline-variant text-secondary focus:ring-secondary accent-secondary"
                        />
                        <span>Subscribe to exclusive member promotions and new drops.</span>
                      </label>
                    </div>

                    <Button type="submit" icon="person_add" fullWidth>
                      Create Customer Account
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Form Bottom Links */}
            <div className="pt-6 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs text-outline font-medium">
              <span className="flex items-center gap-1">
                <Icon name="verified_user" className="text-sm text-emerald-500" /> Protected by Lumen
                Trust
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
              Privacy Policy
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface dark:hover:text-white transition">
              Terms of Use
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface dark:hover:text-white transition">
              Customer Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
