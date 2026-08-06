import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useThemeStore } from "../../stores/theme.store";
import { useCartStore } from "../../stores/cart.store";
import { useWishlistStore } from "../../stores/wishlist.store";
import { useAuthStore } from "../../stores/auth.store";
import { dataService } from "../../services/dataService";
import { Icon } from "../common/Icon";

export const PublicLayout: React.FC = () => {
  const { mode, toggle } = useThemeStore();
  const { items, getSubtotal, getItemCount, removeItem } = useCartStore();
  const { ids: wishlistIds } = useWishlistStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const cartModalRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const mobileAccountBtnRef = useRef<HTMLButtonElement>(null);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (cartModalRef.current && !cartModalRef.current.contains(e.target as Node)) {
        setShowCartModal(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        (!mobileUserMenuRef.current || !mobileUserMenuRef.current.contains(e.target as Node)) &&
        (!mobileAccountBtnRef.current || !mobileAccountBtnRef.current.contains(e.target as Node))
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const liveSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return dataService
      .getProducts()
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
  }, [searchQuery]);

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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setToastMessage("Thank you for subscribing to Lumen updates!");
    setNewsletterEmail("");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMobileNavigate = (path: string) => {
    setShowUserMenu(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-background text-on-background">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-fade-up">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700">
            <Icon name="check_circle" className="text-emerald-400 text-base" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs py-2.5 px-6 font-medium border-b border-slate-800">
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
              placeholder="Search products, brands..."
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
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-surface shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-on-surface group-hover:text-secondary truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-outline uppercase tracking-wider">
                              {product.brand || product.category} &bull; ${product.price.toFixed(2)}
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
                    No matching products found for "{searchQuery}"
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
                to="/checkout"
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
                <div className="absolute top-full right-0 mt-2 w-[320px] bg-surface-container-lowest dark:bg-slate-900 rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 p-4 space-y-3">
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
                        <p className="text-xs text-outline">Looks like you haven't added anything yet.</p>
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
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-on-surface truncate">{product.name}</p>
                              <p className="text-[10px] text-outline">
                                Qty: {quantity} &times; ${product.price.toFixed(2)}
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
                          <span className="font-bold text-on-surface">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black text-on-surface">
                          <span>Total Amount:</span>
                          <span className="text-secondary dark:text-secondary-fixed">
                            ${subtotal.toFixed(2)}
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
                        {isAuthenticated && user ? user.name.slice(0, 2).toUpperCase() : "G"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-on-surface truncate">
                          {isAuthenticated && user ? user.name : "Guest User"}
                        </p>
                        <p className="text-[10px] text-outline truncate">
                          {isAuthenticated && user ? user.email : "Sign in to access your portal"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isAuthenticated ? (
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
                        to="/cart"
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

      {/* Main Page Outlet */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary-container text-on-primary py-12 border-t border-slate-800 mt-auto">
        <div className="max-w-container-max mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-white">
                <Icon name="auto_awesome" className="text-sm" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">Lumen</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Illuminate your lifestyle with our curated collection of premium tech, fashion, and modern goods.
              Designed for excellence.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Careers</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Press Release</Link></li>
              <li><Link to="/products" className="hover:text-white transition">Sustainability</Link></li>
            </ul>
          </div>

          <div>
            <h4 id="support" className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/cart" className="hover:text-white transition">Returns &amp; Refunds</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition">Order Tracking</Link></li>
              <li><a href="mailto:support@lumen.com" className="hover:text-white transition">Contact Support</a></li>
              <li><Link to="/admin/login" className="hover:text-white transition">Store Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Stay Connected</h4>
            <p className="text-xs text-slate-400 mb-2">Subscribe to receive exclusive deals and product drops.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white w-full outline-none focus:border-secondary"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-container text-white px-3 py-2 rounded-lg text-xs font-bold transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-container-max mx-auto px-6 mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>&copy; 2026 Lumen Tech Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookies Settings</a>
          </div>
        </div>
      </footer>

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
    </div>
  );
};
