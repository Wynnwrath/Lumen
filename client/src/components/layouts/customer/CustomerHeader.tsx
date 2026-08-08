import { Link, useLocation } from "react-router-dom";
import { useThemeStore } from "../../../stores/theme.store";
import { useCartStore } from "../../../stores/cart.store";
import { useWishlistStore } from "../../../stores/wishlist.store";
import { Icon } from "../../ui/Icon";
import { formatMoney } from "../../../utils/format";
import { FREE_SHIPPING_MIN } from "../../../constants";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderCartPreview } from "./HeaderCartPreview";
import { HeaderUserMenu } from "./HeaderUserMenu";

// Storefront header: announcement bar, logo, nav links, live search, and the
// action icons (wishlist/cart/user). Search, cart preview, and user menu live
// in their own components to keep this file to layout chrome only.
export const CustomerHeader = () => {
  const { mode, toggle } = useThemeStore();
  const { getItemCount } = useCartStore();
  const { ids: wishlistIds } = useWishlistStore();
  const location = useLocation();

  const itemCount = getItemCount();

  return (
    <>
      {/* Top Announcement Bar (desktop only) */}
      <div className="hidden md:flex bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs py-2.5 px-6 font-medium border-b border-slate-800">
        <div className="flex justify-between items-center w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Icon name="local_shipping" className="text-sm text-secondary-fixed" />
              Free Worldwide Express Shipping on orders over {formatMoney(FREE_SHIPPING_MIN)}
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <Icon name="star" className="text-sm text-amber-400" filled />
              4.9/5 Rating (12,400+ verified customer reviews)
            </span>
          </div>
          <div className="flex items-center gap-5 text-slate-300">
            <button
              onClick={toggle}
              className="hidden md:flex hover:text-white transition items-center gap-1.5 font-semibold"
            >
              <Icon name={mode === "dark" ? "light_mode" : "dark_mode"} className="text-sm" />
              <span>Theme</span>
            </button>
            <span className="hidden md:inline text-slate-700">|</span>
            <a href="#support" className="hover:text-white transition font-semibold">
              Need Help?
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="top-0 sticky z-40 shadow-sm dark:shadow-none bg-surface-container-lowest dark:bg-primary-container border-b border-outline-variant/30 backdrop-blur-md">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between w-full px-6 py-4 max-w-container-max mx-auto gap-4">
          {/* Brand Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-primary dark:bg-white text-white dark:text-primary rounded-xl flex items-center justify-center font-black text-lg tracking-tighter shadow-sm group-hover:scale-105 transition duration-200">
                L
              </div>
              <span className="font-extrabold text-xl tracking-tight text-on-surface dark:text-white">LUMEN</span>
            </Link>
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggle}
                className="p-2 text-on-surface hover:text-secondary rounded-full"
                title="Toggle Theme"
              >
                <Icon name={mode === "dark" ? "light_mode" : "dark_mode"} className="text-xl" />
              </button>
              <Link to="/products?wishlist=true" className="p-2 text-primary dark:text-slate-200 relative" title="Wishlist">
                <Icon name="favorite" className="text-xl" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-error text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2 text-primary dark:text-slate-200 relative">
                <Icon name="shopping_cart" className="text-xl" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
            <Link
              to="/"
              className={`${
                location.pathname === "/"
                  ? "text-secondary dark:text-secondary-fixed border-b-2 border-secondary pb-0.5 font-bold"
                  : "text-on-surface-variant hover:text-secondary transition-colors"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`${
                location.pathname === "/products" && !location.search.includes("sale=true")
                  ? "text-secondary dark:text-secondary-fixed border-b-2 border-secondary pb-0.5 font-bold"
                  : "text-on-surface-variant hover:text-secondary transition-colors"
              }`}
            >
              Catalog
            </Link>
            <Link
              to="/products?sale=true"
              className={`${
                location.pathname === "/products" && location.search.includes("sale=true")
                  ? "text-secondary dark:text-secondary-fixed border-b-2 border-secondary pb-0.5 font-bold"
                  : "text-on-surface-variant hover:text-secondary transition-colors"
              }`}
            >
              Deals
            </Link>
          </nav>

          {/* Live Search with Instant Results */}
          <HeaderSearch />

          {/* Header Action Icons (Desktop & Mobile Account Dropdown Target) */}
          <div className="flex items-center gap-4">
            {/* Wishlist Button */}
            <Link
              to="/products?wishlist=true"
              className="hidden md:flex text-primary dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 p-2.5 rounded-full relative transition-all"
              title="Wishlist"
            >
              <Icon name="favorite" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0 right-0 bg-error text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart Icon with Hover Preview */}
            <HeaderCartPreview />

            {/* Desktop User Account Dropdown */}
            <HeaderUserMenu />
          </div>
        </div>
      </header>
    </>
  );
};
