import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useThemeStore } from "../../stores/theme.store";
import { useAuthStore } from "../../stores/auth.store";
import { Icon } from "../ui/Icon";

// Admin shell: sidebar + header + the admin page. Also guards nothing here;
// route protection lives in App.tsx (ProtectedAdminRoute).
export const AdminLayout = () => {
  const { mode, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const getPageConfig = () => {
    if (location.pathname === "/admin" || location.pathname === "/admin/dashboard") {
      return {
        title: "General Metrics",
        showTimeFilter: true,
      };
    }
    if (location.pathname === "/admin/products") {
      return {
        title: "Products Catalog",
        showTimeFilter: false,
      };
    }
    if (location.pathname === "/admin/categories") {
      return {
        title: "Categories",
        showTimeFilter: false,
      };
    }
    if (location.pathname === "/admin/orders") {
      return {
        title: "Orders List",
        showTimeFilter: true,
      };
    }
    if (location.pathname === "/admin/customers") {
      return {
        title: "Customers",
        showTimeFilter: false,
      };
    }
    if (location.pathname === "/admin/coupons") {
      return {
        title: "Coupons & Promotions",
        showTimeFilter: false,
      };
    }
    return {
      title: "Admin Portal",
      showTimeFilter: false,
    };
  };

  const { title, showTimeFilter } = getPageConfig();

  const navItems = [
    { path: "/admin", label: "General Metrics", icon: "grid_view" },
    { path: "/admin/products", label: "Products Catalog", icon: "inventory_2" },
    { path: "/admin/categories", label: "Categories", icon: "category" },
    { path: "/admin/orders", label: "Orders List", icon: "shopping_cart" },
    { path: "/admin/customers", label: "Customers", icon: "group" },
    { path: "/admin/coupons", label: "Coupons", icon: "loyalty" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased min-h-screen flex">
      {/* Left Sidebar Navigation */}
      <aside
        className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } shadow-sm dark:shadow-xl`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-sm">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                  LUMEN
                </span>
                <span className="text-[9px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mt-0.5">
                  Intelligence
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <Icon name="close" className="text-xl" />
            </button>
          </div>

          {/* Active Merchant Profile Card */}
          <div className="p-3.5 mx-3 my-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {user ? user.name.slice(0, 2).toUpperCase() : "LO"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user ? user.name : "Lumen Official Store"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user ? user.email : "admin@lumen.com"}
              </p>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="px-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/admin" && location.pathname === "/admin/dashboard");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${isActive
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <Icon name={item.icon} className="text-lg" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Icon name="storefront" className="text-base" />
            <span>Customer Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left"
          >
            <Icon name="logout" className="text-base" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 z-20 md:hidden"
        ></div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 w-full">
        {/* Top Header Bar */}
        <header className="min-h-16 h-auto py-3.5 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 w-full transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl shrink-0"
            >
              <Icon name="menu" className="text-xl" />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {title}
              </h1>
            </div>
          </div>

          {/* Top Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {showTimeFilter && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Icon name="calendar_today" className="text-sm text-slate-500 dark:text-slate-400" />
                <span className="text-[11px] sm:text-xs">Last 7 days</span>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggle}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition border border-slate-200 dark:border-slate-700/80"
              title="Toggle Theme"
            >
              <Icon name={mode === "dark" ? "light_mode" : "dark_mode"} className="text-lg" />
            </button>
          </div>
        </header>

        {/* Main Body Outlet */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
