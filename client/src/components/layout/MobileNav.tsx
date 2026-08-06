import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCartStore } from "../../stores/cart.store";
import { useWishlistStore } from "../../stores/wishlist.store";
import { useAuthStore } from "../../stores/auth.store";
import { Icon } from "../common/Icon";
import { useClickOutside } from "../../hooks/useClickOutside";

export const MobileNav = () => {
  const { getItemCount } = useCartStore();
  const { ids: wishlistIds } = useWishlistStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const mobileAccountBtnRef = useRef<HTMLButtonElement>(null);

  const itemCount = getItemCount();

  const handleMobileNavigate = (path: string) => {
    setShowUserMenu(false);
    navigate(path);
  };

  // close the sheet when clicking outside it (but not when clicking the toggle button)
  useClickOutside([mobileUserMenuRef, mobileAccountBtnRef], () => setShowUserMenu(false));

  return (
    <>
      {/* Mobile Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-surface dark:bg-slate-900 border-t border-outline-variant/40 flex justify-around items-center h-16 px-2 shadow-lg">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center p-2 active:scale-95 ${
            location.pathname === "/" ? "text-secondary font-bold" : "text-outline"
          }`}
        >
          <Icon name="home" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>
        <Link
          to="/products"
          className={`flex flex-col items-center justify-center p-2 active:scale-95 ${
            location.pathname === "/products" ? "text-secondary font-bold" : "text-outline"
          }`}
        >
          <Icon name="grid_view" />
          <span className="text-[10px] mt-0.5">Catalog</span>
        </Link>
        <Link
          to="/cart"
          className="flex flex-col items-center justify-center text-outline hover:text-secondary p-2 active:scale-95 relative"
        >
          <Icon name="shopping_cart" />
          {itemCount > 0 && (
            <span className="absolute top-1 right-2 bg-secondary text-on-secondary text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Cart</span>
        </Link>
        <Link
          to="/products?wishlist=true"
          className="flex flex-col items-center justify-center text-outline hover:text-secondary p-2 active:scale-95 relative"
        >
          <Icon name="favorite" />
          {wishlistIds.length > 0 && (
            <span className="absolute top-1 right-2 bg-error text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {wishlistIds.length}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Saved</span>
        </Link>
        <button
          ref={mobileAccountBtnRef}
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex flex-col items-center justify-center p-2 active:scale-95 ${
            showUserMenu ? "text-secondary font-bold" : "text-outline"
          }`}
        >
          <Icon name="account_circle" />
          <span className="text-[10px] mt-0.5">Account</span>
        </button>
      </nav>

      {/* Mobile Account Menu Bottom Sheet (Clear Background & Guaranteed Navigation) */}
      {showUserMenu && (
        <>
          {/* Transparent click-outside backdrop - no graying */}
          <div
            className="fixed inset-0 z-40 md:hidden bg-transparent"
            onClick={() => setShowUserMenu(false)}
          ></div>

          {/* Bottom sheet drawer attached to bottom dock */}
          <div
            ref={mobileUserMenuRef}
            className="fixed bottom-16 left-0 right-0 z-50 md:hidden bg-surface-container-lowest dark:bg-slate-900 border-t border-outline-variant/30 dark:border-slate-800 shadow-2xl p-5 rounded-t-3xl space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm shrink-0">
                  {isAuthenticated && user ? user.name.slice(0, 2).toUpperCase() : "G"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-on-surface truncate">
                    {isAuthenticated && user ? user.name : "Guest User"}
                  </p>
                  <p className="text-xs text-outline truncate">
                    {isAuthenticated && user ? user.email : "Sign in to access your portal"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUserMenu(false)}
                className="p-1.5 text-outline hover:text-on-surface rounded-full bg-surface dark:bg-slate-800 shrink-0"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleMobileNavigate("/checkout")}
                  className="w-full flex items-center gap-3 p-3 text-xs font-bold text-on-surface hover:bg-surface-container dark:hover:bg-slate-800 rounded-xl transition text-left"
                >
                  <Icon name="person" className="text-secondary" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => handleMobileNavigate("/cart")}
                  className="w-full flex items-center gap-3 p-3 text-xs font-bold text-on-surface hover:bg-surface-container dark:hover:bg-slate-800 rounded-xl transition text-left"
                >
                  <Icon name="shopping_bag" className="text-secondary" />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => handleMobileNavigate("/admin")}
                  className="w-full flex items-center gap-3 p-3 text-xs font-bold text-on-surface hover:bg-surface-container dark:hover:bg-slate-800 rounded-xl transition text-left"
                >
                  <Icon name="storefront" className="text-secondary" />
                  <span>Admin Portal</span>
                </button>
                <div className="border-t border-outline-variant/20 dark:border-slate-800 my-2"></div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition text-left"
                >
                  <Icon name="logout" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => handleMobileNavigate("/login")}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-on-surface bg-surface-container dark:bg-slate-800/80 rounded-xl transition border border-outline-variant/30 text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="person" className="text-secondary text-lg" />
                    <span>User Sign In / Register</span>
                  </div>
                  <Icon name="chevron_right" className="text-sm text-outline" />
                </button>
                <button
                  onClick={() => handleMobileNavigate("/admin/login")}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-secondary dark:text-secondary-fixed bg-secondary/10 rounded-xl transition border border-secondary/30 text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="storefront" className="text-lg" />
                    <span>Admin Login</span>
                  </div>
                  <Icon name="chevron_right" className="text-sm text-secondary" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
