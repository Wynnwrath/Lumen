import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store";
import { Icon } from "../../ui/Icon";
import { useClickOutside } from "../../../hooks/useClickOutside";

// Desktop account dropdown: shows the signed-in user's menu (profile/orders/
// admin/logout) or the guest sign-in links.
export const HeaderUserMenu = () => {
  const { user, logout } = useAuthStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // close the dropdown when clicking outside
  useClickOutside(userMenuRef, () => setShowUserMenu(false));

  return (
    <div className="hidden md:block relative" ref={userMenuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex text-primary dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 p-2 rounded-full transition-all items-center justify-center gap-1 focus:outline-none"
        title="User Account"
      >
        <Icon name="account_circle" className="text-xl" />
        <Icon name="expand_more" className="text-xs text-outline" />
      </button>

      {showUserMenu && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-surface-container-lowest dark:bg-slate-800 rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 p-2 space-y-1">
          <div className="px-3 py-2.5 bg-surface dark:bg-slate-700/60 rounded-xl border border-outline-variant/20 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                {user ? user.name.slice(0, 2).toUpperCase() : "G"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-on-surface truncate">
                  {user ? user.name : "Guest User"}
                </p>
                <p className="text-[10px] text-outline truncate">
                  {user ? user.email : "Sign in to access your portal"}
                </p>
              </div>
            </div>
          </div>

          {user ? (
            <>
              <Link
                to="/checkout"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container dark:hover:bg-slate-700/70 rounded-xl transition"
              >
                <Icon name="person" className="text-base text-secondary" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/orders"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container dark:hover:bg-slate-700/70 rounded-xl transition"
              >
                <Icon name="shopping_bag" className="text-base text-secondary" />
                <span>My Orders</span>
              </Link>
              <Link
                to="/admin"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container dark:hover:bg-slate-700/70 rounded-xl transition"
              >
                <Icon name="storefront" className="text-base text-secondary" />
                <span>Admin Portal</span>
              </Link>
              <div className="border-t border-outline-variant/20 my-1"></div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition text-left"
              >
                <Icon name="logout" className="text-base text-red-600 dark:text-red-400" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-1">
              <Link
                to="/login"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container dark:hover:bg-slate-700/70 rounded-xl transition"
              >
                <Icon name="person" className="text-base text-secondary" />
                <span>User Sign In / Register</span>
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-secondary dark:text-secondary-fixed hover:bg-secondary/10 rounded-xl transition border border-secondary/20"
              >
                <Icon name="storefront" className="text-base" />
                <span>Admin Login</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
