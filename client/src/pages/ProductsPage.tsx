import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useWishlistStore } from "../stores/wishlist.store";
import { useCatalogProducts } from "../hooks/useCatalogProducts";
import { useCategories } from "../hooks/useCategories";
import { CATEGORY_META } from "../constants/home";
import { Icon } from "../components/ui/Icon";
import { ProductCard } from "../components/customer/products/ProductCard";
import { ProductGridSkeleton } from "../components/ui/skeletons";
import { EmptyState } from "../components/ui/EmptyState";
import { Pagination } from "../components/customer/products/Pagination";
import { useAddToCart } from "../hooks/useAddToCart";

// Product listing with filters (category/search/sale/wishlist), sorting, and
// pagination (10 products per page).
export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleAddToCart = useAddToCart();
  const { ids: wishlistIds, prune } = useWishlistStore();

  const urlCategory = searchParams.get("category") || "all";
  const urlSearch = searchParams.get("search") || "";
  const urlSale = searchParams.get("sale") === "true";
  const urlWishlist = searchParams.get("wishlist") === "true";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [onlySale, setOnlySale] = useState(urlSale);
  const [onlyWishlist, setOnlyWishlist] = useState(urlWishlist);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortBy, setSortBy] = useState<"rating" | "featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { products, loading: productsLoading } = useCatalogProducts();
  const { categories: apiCategories } = useCategories();

  // Prune stale wishlist ids that no longer match any product in the catalog
  useEffect(() => {
    if (products.length > 0 && wishlistIds.length > 0) {
      const validIds = products.map((p) => p._id);
      prune(validIds);
    }
  }, [products, wishlistIds, prune]);

  // URL params initialize the filter state on mount and mirror external URL
  // changes (browser back/forward, header search) back into local state.
  // Local state stays the source of truth for rendering; this effect only
  // writes when the URL-driven value actually differs, and it resets
  // pagination whenever the URL-driven filter set changes.
  useEffect(() => {
    setSearchQuery((cur) => (cur === urlSearch ? cur : urlSearch));
    setSelectedCategory((cur) => (cur === urlCategory ? cur : urlCategory));
    setOnlySale((cur) => (cur === urlSale ? cur : urlSale));
    setOnlyWishlist((cur) => (cur === urlWishlist ? cur : urlWishlist));
    setPage(1);
  }, [urlCategory, urlSearch, urlSale, urlWishlist]);

  // Categories list with counts and icons, derived from the real API so every
  // category created in admin shows up in the filter.
  const categories = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const cat = p.category.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return [
      { slug: "all", label: "All Products", icon: "grid_view", count: counts.all || 0 },
      ...apiCategories.map((c) => ({
        slug: c.slug,
        label: CATEGORY_META[c.slug]?.label || c.name,
        icon: CATEGORY_META[c.slug]?.icon || c.icon || "category",
        count: counts[c.slug] || 0,
      })),
    ];
  }, [products, apiCategories]);

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
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
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
        if (sortBy === "newest") return (b.arrival ? 1 : 0) - (a.arrival ? 1 : 0);
        return 0;
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    onlySale,
    onlyWishlist,
    onlyInStock,
    maxPrice,
    sortBy,
    wishlistIds,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    onlySale ||
    onlyWishlist ||
    onlyInStock ||
    maxPrice < 1500;

  const handleResetFilters = () => {
    setPage(1);
    setSelectedCategory("all");
    setSearchQuery("");
    setOnlySale(false);
    setOnlyWishlist(false);
    setOnlyInStock(false);
    setMaxPrice(1500);
    setSearchParams({});
  };

  const handleCategorySelect = (catSlug: string) => {
    setPage(1);
    setSelectedCategory(catSlug);
    setSearchParams((prev) => {
      if (catSlug === "all") prev.delete("category");
      else prev.set("category", catSlug);
      return prev;
    });
  };

  // Lock page scroll while the mobile filter drawer is open.
  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  // Filter controls shared by the desktop sidebar and the mobile drawer.
  const filterPanel = (
    <>
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
                onChange={(e) => {
                  setPage(1);
                  setMaxPrice(Number(e.target.value));
                }}
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
                  onChange={(e) => {
                    setPage(1);
                    setOnlyInStock(e.target.checked);
                  }}
              className="rounded border-outline-variant/80 text-secondary focus:ring-secondary w-3.5 h-3.5"
            />
            <span>In Stock Only</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-on-surface font-semibold cursor-pointer hover:text-secondary transition">
            <input
              type="checkbox"
              checked={onlySale}
                  onChange={(e) => {
                    setPage(1);
                    setOnlySale(e.target.checked);
                  }}
              className="rounded border-outline-variant/80 text-secondary focus:ring-secondary w-3.5 h-3.5"
            />
            <span>On Sale Only</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-on-surface font-semibold cursor-pointer hover:text-secondary transition">
            <input
              type="checkbox"
              checked={onlyWishlist}
                  onChange={(e) => {
                    setPage(1);
                    setOnlyWishlist(e.target.checked);
                  }}
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
    </>
  );

  return (
    <main className="max-w-container-max mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8 flex-grow w-full">
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
              onChange={(e) => {
                setPage(1);
                setSortBy(e.target.value as "rating" | "featured" | "price-asc" | "price-desc" | "newest");
              }}
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
        {/* Filter Panel (Desktop sidebar + Mobile slide-in drawer) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 bg-surface-container-lowest dark:bg-slate-800/80 p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
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
          {filterPanel}
        </aside>

        {/* Mobile Filter Drawer (overlay on phones/tablets) */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/60"
              onClick={() => setIsMobileFilterOpen(false)}
            ></div>
            <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface-container-lowest dark:bg-slate-800/90 shadow-2xl border-r border-outline-variant/30 flex flex-col">
              <div className="flex items-center justify-between p-5 pb-0 shrink-0">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Icon name="filter_alt" className="text-secondary" />
                  <span>Filter Options</span>
                </h3>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
                    >
                      <Icon name="refresh" className="text-xs" /> Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 text-outline hover:text-on-surface rounded-lg bg-surface dark:bg-slate-700"
                    aria-label="Close filters"
                  >
                    <Icon name="close" className="text-lg" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                {filterPanel}
              </div>
            </aside>
          </div>
        )}

        {/* Right Main Product Area */}
        <section className="lg:col-span-9 space-y-3">
          {/* Results Counter */}
          <div className="flex justify-between items-center text-xs text-outline px-1">
            <span className="font-semibold">{filteredProducts.length} products found</span>
            {searchQuery && (
              <span className="text-secondary font-bold truncate max-w-[180px]">
                Search: {`"${searchQuery}"`}
              </span>
            )}
          </div>

          {/* Product Cards Container (2-Column Mobile Grid) */}
          {productsLoading ? (
            <ProductGridSkeleton count={8} />
          ) : filteredProducts.length === 0 ? (
            onlyWishlist ? (
              <EmptyState
                icon="favorite"
                title="No saved items"
                subtitle="You haven't saved any products yet. Browse the catalog and tap the heart icon to save items here."
                action={
                  <Link
                    to="/products"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold shadow-xs hover:bg-secondary-container transition"
                  >
                    Browse Catalog
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon="search_off"
                title="No products found"
                subtitle="Try adjusting your price range, availability toggles, or category filters."
                action={
                  <button onClick={handleResetFilters} className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold shadow-xs hover:bg-secondary-container transition">
                    Reset Filters
                  </button>
                }
              />
            )
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
              {pagedProducts.map((product) => (
                <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {pagedProducts.map((product) => (
                <ProductCard key={product._id} product={product} variant="list" onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!productsLoading && filteredProducts.length > 0 && totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              start={(page - 1) * PAGE_SIZE + 1}
              end={Math.min(page * PAGE_SIZE, filteredProducts.length)}
              onChange={setPage}
            />
          )}
        </section>
      </div>
    </main>
  );
};
