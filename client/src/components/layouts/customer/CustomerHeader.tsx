import React, { useState, useRef, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useThemeStore } from "../../../stores/theme.store";
import { useCartStore } from "../../../stores/cart.store";
import { useWishlistStore } from "../../../stores/wishlist.store";
import { useAuthStore } from "../../../stores/auth.store";
import { Icon } from "../../ui/Icon";
import { ProductImage } from "../../ui/ProductImage";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useCatalogProducts } from "../../../hooks/useCatalogProducts";
import { formatMoney } from "../../../utils/format";

export const CustomerHeader = () => {
  const { mode, toggle } = useThemeStore();
  const { items, getSubtotal, getItemCount, removeItem } = useCartStore();
  const { ids: wishlistIds } = useWishlistStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { products: catalog } = useCatalogProducts();

  const searchRef = useRef<HTMLDivElement>(null);
  const cartModalRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  // close each dropdown when clicking outside its container
  useClickOutside(searchRef, () => setShowSearchDropdown(false));
  useClickOutside(cartModalRef, () => setShowCartModal(false));
  useClickOutside(userMenuRef, () => setShowUserMenu(false));

  const liveSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [searchQuery, catalog]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchDropdown(e.target.value.trim().length > 0);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    setShowSearchDropdown(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSearchDropdown(false);
  };

  // Keep the header search box in sync with the catalog URL: clear it when
  // leaving /products, and reflect external navigation (e.g. filters reset).
  useEffect(() => {
    if (location.pathname === "/products") {
      const s = new URLSearchParams(location.search).get("search") || "";
      setSearchQuery((cur) => (cur === s ? cur : s));
    } else {
      setSearchQuery("");
    }
    setShowSearchDropdown(false);
  }, [location.pathname, location.search]);

  return (
    <>
      {/* Top Announcement Bar (desktop only) */}
      <div className="hidden md:flex bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs py-2.5 px-6 font-medium border-b border-slate-800">
        <div className="flex justify-between items-center w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Icon name="local_shipping" className="text-sm text-secondary-fixed" />
              Free Worldwide Express Shipping on orders over $100
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
              <Link to="/products?wishlist=true" className="p-2 text-primary dark:text-inverse-primary relative" title="Wishlist">
                <Icon name="favorite" className="text-xl" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-error text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2 text-primary dark:text-inverse-primary relative">
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

          {/* Search Input */}
          <div className="w-full md:w-80 lg:w-96 relative" ref={searchRef}>
            <Icon
              name="search"
              onClick={handleSearchSubmit}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg cursor-pointer hover:text-secondary transition"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              placeholder="Search products..."
              className="w-full bg-surface text-on-surface border border-outline-variant/60 focus:border-secondary rounded-full py-2 pl-10 pr-9 text-xs font-medium shadow-xs focus:shadow-md transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
              >
                <Icon name="close" className="text-sm" />
              </button>
            )}

            {/* Instant Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest dark:bg-slate-800 rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 divide-y divide-outline-variant/10 max-h-96 overflow-y-auto">
                {liveSearchResults.length > 0 ? (
                  <>
                    <div className="p-2 space-y-1">
                      {liveSearchResults.slice(0, 5).map((product) => (
                        <button
                          key={product._id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate(`/product/${product._id}`);
                          }}
                          className="w-full flex items-center gap-3 p-2 hover:bg-surface-container dark:hover:bg-slate-700/70 rounded-xl transition text-left group"
                        >
                          <ProductImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-surface shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-on-surface group-hover:text-secondary truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-outline uppercase tracking-wider">
                              {product.category} &bull; {formatMoney(product.price)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-2 bg-surface/50 dark:bg-slate-800/50">
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-left py-2 px-3 hover:bg-surface-container dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-secondary flex items-center justify-between"
                      >
                        <span>View all {liveSearchResults.length} results in Catalog</span>
                        <Icon name="arrow_forward" className="text-sm" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-xs text-outline font-medium">
                    No matching products found for {`"${searchQuery}"`}
                  </div>
                )}
              </div>
            )}
          </div>

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

            {/* Cart Icon Container with Hover Preview Modal */}
            <div
              className="hidden md:block relative"
              ref={cartModalRef}
              onMouseEnter={() => setShowCartModal(true)}
              onMouseLeave={() => setShowCartModal(false)}
            >
              <Link
                to="/cart"
                className="text-primary dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 p-2.5 rounded-full relative transition-all flex items-center justify-center"
                title="Shopping Cart"
              >
                <Icon name="shopping_cart" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Cart Quick Preview Dropdown */}
              {showCartModal && (
                <div className="absolute top-full right-0 pt-1 z-50">
                  <div className="w-[320px] bg-surface-container-lowest dark:bg-slate-900 rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5 gap-2">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider whitespace-nowrap">
                      Cart Quick Preview
                    </span>
                    <span className="text-xs font-extrabold text-secondary whitespace-nowrap">{itemCount} Items</span>
                  </div>

                  {/* Mini List or Empty State */}
                  {items.length === 0 ? (
                    <div className="py-6 px-4 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                        <Icon name="shopping_bag" className="text-2xl" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-on-surface">Your cart is empty</p>
                        <p className="text-xs text-outline">Looks like you haven&apos;t added anything yet.</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowCartModal(false);
                          navigate("/products");
                        }}
                        className="w-full mt-2 bg-secondary hover:bg-secondary-container text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <span>Browse Catalog</span>
                        <Icon name="arrow_forward" className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                        {items.map(({ product, quantity }) => (
                          <div
                            key={product._id}
                            className="flex items-center justify-between gap-2 p-2 bg-surface dark:bg-slate-800/60 rounded-xl"
                          >
                            <ProductImage
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-on-surface truncate">{product.name}</p>
                              <p className="text-[10px] text-outline">
                                Qty: {quantity} &times; {formatMoney(product.price)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(product._id)}
                              className="text-outline hover:text-error p-1"
                            >
                              <Icon name="close" className="text-sm" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-outline-variant/20 pt-3 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                          <span>Subtotal:</span>
                          <span className="font-bold text-on-surface">{formatMoney(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black text-on-surface">
                          <span>Total Amount:</span>
                          <span className="text-secondary dark:text-secondary-fixed">
                            {formatMoney(subtotal)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setShowCartModal(false);
                            navigate("/checkout");
                          }}
                          className="w-full mt-2 bg-secondary hover:bg-secondary-container text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <span>Proceed to Checkout</span>
                          <Icon name="arrow_forward" className="text-sm" />
                        </button>
                      </div>
                    </>
                  )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop User Account Dropdown Container */}
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
                        {user && user ? user.name.slice(0, 2).toUpperCase() : "G"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-on-surface truncate">
                          {user && user ? user.name : "Guest User"}
                        </p>
                        <p className="text-[10px] text-outline truncate">
                          {user && user ? user.email : "Sign in to access your portal"}
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
          </div>
        </div>
      </header>
    </>
  );
};
