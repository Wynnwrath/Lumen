import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "../../ui/Icon";
import { ProductImage } from "../../ui/ProductImage";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useCatalogProducts } from "../../../hooks/useCatalogProducts";
import { formatMoney } from "../../../utils/format";

// Header search box with an instant-results dropdown and URL sync.
export const HeaderSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { products: catalog } = useCatalogProducts();

  const searchRef = useRef<HTMLDivElement>(null);

  // close the dropdown when clicking outside the search box
  useClickOutside(searchRef, () => setShowSearchDropdown(false));

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
                    key={product.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      navigate(`/product/${product.id}`);
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
  );
};
