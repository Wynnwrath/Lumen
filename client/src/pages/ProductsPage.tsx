import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { dataService } from "../services/dataService";
import { useCartStore } from "../stores/cart.store";
import { useWishlistStore } from "../stores/wishlist.store";
import type { Product } from "../types";
import { Icon } from "../components/common/Icon";
import { ProductCard } from "../components/common/ProductCard";
import { Toast } from "../components/common/Toast";
import { useToast } from "../hooks/useToast";

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCartStore();
  const { ids: wishlistIds } = useWishlistStore();
  const { toast, showToast } = useToast();

  const urlCategory = searchParams.get("category") || "all";
  const urlSearch = searchParams.get("search") || "";
  const urlSale = searchParams.get("sale") === "true";
  const urlWishlist = searchParams.get("wishlist") === "true";

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearchInput, setBrandSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [onlySale, setOnlySale] = useState(urlSale);
  const [onlyWishlist, setOnlyWishlist] = useState(urlWishlist);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortBy, setSortBy] = useState<"rating" | "featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const products = dataService.getProducts();

  // Sync state if URL changes
  useEffect(() => {
    setSearchQuery(urlSearch);
    setSelectedCategory(urlCategory);
    setOnlySale(urlSale);
    setOnlyWishlist(urlWishlist);
  }, [urlCategory, urlSearch, urlSale, urlWishlist]);

  // Unique Brands with Counts
  const availableBrands = useMemo(() => {
    const brandMap: Record<string, number> = {};
    products.forEach((p) => {
      if (p.brand) {
        brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
      }
    });
    return Object.entries(brandMap)
      .map(([brand, count]) => ({ brand, count }))
      .filter(({ brand }) => brand.toLowerCase().includes(brandSearchInput.toLowerCase()));
  }, [products, brandSearchInput]);

  // Categories list with counts and icons
  const categories = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const cat = p.category.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return [
      { slug: "all", label: "All Products", icon: "grid_view", count: counts.all || 0 },
      { slug: "electronics", label: "Electronics", icon: "devices", count: counts.electronics || 0 },
      { slug: "fashion", label: "Fashion", icon: "checkroom", count: counts.fashion || 0 },
      { slug: "luxury", label: "Luxury", icon: "diamond", count: counts.luxury || 0 },
      { slug: "home", label: "Home Decor", icon: "chair", count: counts.home || 0 },
      { slug: "beauty", label: "Beauty", icon: "spa", count: counts.beauty || 0 },
      { slug: "groceries", label: "Groceries", icon: "shopping_basket", count: counts.groceries || 0 },
    ];
  }, [products]);

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (
          selectedCategory !== "all" &&
          p.category.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return false;
        }
        // Brand filter
        if (selectedBrands.length > 0 && (!p.brand || !selectedBrands.includes(p.brand))) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchDesc && !matchCat) return false;
        }
        // Sale filter
        if (onlySale && !p.isSale) return false;
        // Wishlist filter
        if (onlyWishlist && !wishlistIds.includes(p._id)) return false;
        // In stock filter
        if (onlyInStock && p.stock <= 0) return false;
        // Price filter
        if (p.price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "newest") return (b.arrival || b.isNew ? 1 : 0) - (a.arrival || a.isNew ? 1 : 0);
        return 0;
      });
  }, [
    products,
    selectedCategory,
    selectedBrands,
    searchQuery,
    onlySale,
    onlyWishlist,
    onlyInStock,
    maxPrice,
    sortBy,
    wishlistIds,
  ]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedBrands.length > 0 ||
    searchQuery.trim() !== "" ||
    onlySale ||
    onlyWishlist ||
    onlyInStock ||
    maxPrice < 1500;

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrands([]);
    setBrandSearchInput("");
    setSearchQuery("");
    setOnlySale(false);
    setOnlyWishlist(false);
    setOnlyInStock(false);
    setMaxPrice(1500);
    setSearchParams({});
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem(product, 1);
    showToast(`Added "${product.name}" to cart!`, "success");
  };

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setSearchParams((prev) => {
      if (catSlug === "all") prev.delete("category");
      else prev.set("category", catSlug);
      return prev;
    });
  };

  return (
    <main className="max-w-container-max mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8 flex-grow w-full">
      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* Header Section: Title & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-outline-variant/30">
        {/* Title & Breadcrumb */}
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            {selectedCategory !== "all"
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Product Catalog"}
          </h1>
          <nav className="flex items-center gap-1.5 text-xs text-outline">
            <Link to="/" className="hover:text-secondary transition font-medium">
              Home
            </Link>
            <Icon name="chevron_right" className="text-xs" />
            <span className="font-semibold text-on-surface">
              {selectedCategory !== "all"
                ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                : "Catalog"}
            </span>
          </nav>
        </div>

        {/* Top Right Sort & Filter Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 shrink-0">
          {/* Mobile Filter Drawer Button */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 bg-secondary text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm"
          >
            <Icon name="filter_list" className="text-sm" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-container-lowest dark:bg-slate-800 text-on-surface text-xs font-bold rounded-xl border border-outline-variant/60 py-2 px-3 focus:border-secondary outline-none cursor-pointer shadow-xs"
            >
              <option value="featured">Featured</option>
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-surface-container-lowest dark:bg-slate-800 p-1 rounded-xl border border-outline-variant/40">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid" ? "bg-secondary text-white shadow-xs" : "text-outline hover:text-on-surface"
              }`}
              title="Grid View"
            >
              <Icon name="grid_view" className="text-sm" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "list" ? "bg-secondary text-white shadow-xs" : "text-outline hover:text-on-surface"
              }`}
              title="List View"
            >
              <Icon name="view_list" className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Category Scroll Bar for Mobile */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 hide-scroll">
        {categories.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-secondary text-white shadow-xs"
                  : "bg-surface-container dark:bg-slate-800 text-on-surface-variant hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Icon name={cat.icon} className="text-sm" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body Section: Clean React Filter Sidebar + Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filter Panel (Desktop sidebar + Mobile Collapsible Drawer) */}
        <aside className={`lg:col-span-3 space-y-5 bg-surface-container-lowest dark:bg-slate-800/80 p-5 rounded-2xl border border-outline-variant/30 shadow-sm ${
          isMobileFilterOpen ? "block" : "hidden lg:block"
        }`}>
          {/* Header & Clear Filters Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Icon name="filter_alt" className="text-secondary" />
              <span>Filter Options</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
              >
                <Icon name="refresh" className="text-xs" /> Clear All
              </button>
            )}
          </div>

          <hr className="border-outline-variant/20" />

          {/* Categories Section */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-outline">Categories</h4>
            <div className="space-y-1">
              {categories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
                return (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      handleCategorySelect(cat.slug);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-secondary text-white shadow-xs font-bold"
                        : "text-on-surface-variant hover:bg-surface-container dark:hover:bg-slate-700/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon name={cat.icon} className="text-base" />
                      <span>{cat.label}</span>
                    </span>
                    <span className={`text-[10px] ${isActive ? "text-white/80" : "text-outline"}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-outline-variant/20" />

          {/* Brand Filter Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-outline">Brand</h4>
              {selectedBrands.length > 0 && (
                <button
                  onClick={() => setSelectedBrands([])}
                  className="text-[10px] font-bold text-secondary hover:underline"
                >
                  Clear ({selectedBrands.length})
                </button>
              )}
            </div>

            {/* Brand Search Input */}
            <div className="relative">
              <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-outline" />
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearchInput}
                onChange={(e) => setBrandSearchInput(e.target.value)}
                className="w-full bg-surface dark:bg-slate-700/50 text-on-surface border border-outline-variant/60 rounded-lg py-1 pl-8 pr-2 text-xs outline-none focus:border-secondary"
              />
            </div>

            {/* Checkbox List */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {availableBrands.map(({ brand, count }) => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <label
                    key={brand}
                    className="flex items-center justify-between text-xs text-on-surface font-semibold cursor-pointer hover:text-secondary transition"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedBrands(selectedBrands.filter((b) => b !== brand));
                          } else {
                            setSelectedBrands([...selectedBrands, brand]);
                          }
                        }}
                        className="rounded border-outline-variant/80 text-secondary focus:ring-secondary w-3.5 h-3.5"
                      />
                      <span>{brand}</span>
                    </span>
                    <span className="text-[10px] text-outline font-normal">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <hr className="border-outline-variant/20" />

          {/* Price Range Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-outline">Price Range</h4>
              <span className="text-xs font-extrabold text-secondary">${maxPrice}</span>
            </div>
            <div className="space-y-2 pt-1">
              <input
                type="range"
                min="0"
                max="1500"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between text-[10px] font-bold text-outline">
                <span>$0</span>
                <span>$1,500</span>
              </div>
            </div>
          </div>

          <hr className="border-outline-variant/20" />

          {/* Availability & Special Offers */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-outline">Availability & Offers</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-on-surface font-semibold cursor-pointer hover:text-secondary transition">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-outline-variant/80 text-secondary focus:ring-secondary w-3.5 h-3.5"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-on-surface font-semibold cursor-pointer hover:text-secondary transition">
                <input
                  type="checkbox"
                  checked={onlySale}
                  onChange={(e) => setOnlySale(e.target.checked)}
                  className="rounded border-outline-variant/80 text-secondary focus:ring-secondary w-3.5 h-3.5"
                />
                <span>On Sale Only</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-on-surface font-semibold cursor-pointer hover:text-secondary transition">
                <input
                  type="checkbox"
                  checked={onlyWishlist}
                  onChange={(e) => setOnlyWishlist(e.target.checked)}
                  className="rounded border-outline-variant/80 text-secondary focus:ring-secondary w-3.5 h-3.5"
                />
                <span>Saved Wishlist Items</span>
              </label>
            </div>
          </div>

          {/* Mobile Done Button */}
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-full lg:hidden py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Apply Filters
          </button>
        </aside>

        {/* Right Main Product Area */}
        <section className="lg:col-span-9 space-y-3">
          {/* Results Counter */}
          <div className="flex justify-between items-center text-xs text-outline px-1">
            <span className="font-semibold">{filteredProducts.length} products found</span>
            {searchQuery && (
              <span className="text-secondary font-bold truncate max-w-[180px]">
                Search: "{searchQuery}"
              </span>
            )}
          </div>

          {/* Product Cards Container (2-Column Mobile Grid) */}
          {filteredProducts.length === 0 ? (
            <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl border border-outline-variant/30 p-8 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-outline">
                <Icon name="search_off" className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-on-surface">No products found</h3>
              <p className="text-xs text-outline max-w-xs mx-auto">
                Try adjusting your price range, availability toggles, or category filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold shadow-xs hover:bg-secondary-container transition"
              >
                Reset Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} variant="list" onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
