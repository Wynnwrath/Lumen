// Product Listing Page Controller (products.js)

let currentCategory = "all";
let currentSearch = "";
let currentSearchQuery = "";
let currentMaxPrice = 1500;
let selectedBrands = [];
let inStockOnly = false;
let onSaleOnly = false;
let currentSort = "rating";
let isGridView = true;

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initCatalogPage();
  setupCartDrawerListeners();
  updateHeaderCounts();
});

function initCatalogPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get("category");
  const searchParam = urlParams.get("search");

  if (catParam) currentCategory = catParam.toLowerCase();
  if (searchParam) {
    currentSearchQuery = searchParam;
    currentSearch = searchParam.toLowerCase();
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = searchParam;
    document.getElementById("clear-search")?.classList.remove("hidden");
  }

  populateBrandCheckboxes();
  setupCatalogEventListeners();
  syncCategoryTabUI();
  renderCatalog();
}

function populateBrandCheckboxes() {
  const products = window.lumenStore.getProducts(true);
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
  const container = document.getElementById("brand-checkboxes");
  if (!container) return;

  container.innerHTML = brands.map((brand) => `
    <label class="brand-item flex items-center gap-2.5 text-sm text-on-surface font-semibold cursor-pointer hover:text-secondary transition" data-brand="${brand.toLowerCase()}">
      <input type="checkbox" value="${brand}" class="brand-checkbox rounded border-outline-variant/80 text-secondary focus:ring-secondary accent-secondary"/>
      <span>${brand}</span>
    </label>
  `).join("");

  // Brand search input listener
  const brandSearch = document.getElementById("brand-search-input");
  if (brandSearch) {
    brandSearch.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll(".brand-item").forEach((item) => {
        const b = item.getAttribute("data-brand");
        item.style.display = b.includes(q) ? "flex" : "none";
      });
    });
  }
}

function setupCatalogEventListeners() {
  setupLiveSearch();
  setupHoverCartModal();

  // Category Horizontal Tabs
  document.querySelectorAll(".cat-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const cat = tab.getAttribute("data-category");
      setCatalogCategory(cat);
    });
  });

  // Search input listeners
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const searchIconBtn = document.getElementById("search-icon-btn");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearSearchBtn?.classList.toggle("hidden", !e.target.value.trim());
    });
  }
  if (searchIconBtn && searchInput) {
    searchIconBtn.addEventListener("click", () => {
      const q = searchInput.value.trim();
      document.getElementById("search-results-dropdown")?.classList.add("hidden");
      currentSearchQuery = q;
      currentSearch = q.toLowerCase();
      syncCategoryTabUI();
      renderCatalog();
    });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentSearchQuery = "";
      currentSearch = "";
      clearSearchBtn.classList.add("hidden");
      syncCategoryTabUI();
      renderCatalog();
    });
  }

  // Price range slider
  const slider = document.getElementById("price-range-slider");
  const priceDisplay = document.getElementById("price-max-display");
  if (slider) {
    slider.addEventListener("input", (e) => {
      currentMaxPrice = parseFloat(e.target.value);
      if (priceDisplay) priceDisplay.textContent = `$${currentMaxPrice.toLocaleString()}`;
      renderCatalog();
    });
  }

  // Brand Checkboxes
  document.getElementById("brand-checkboxes")?.addEventListener("change", () => {
    const checked = document.querySelectorAll(".brand-checkbox:checked");
    selectedBrands = Array.from(checked).map((cb) => cb.value);
    renderCatalog();
  });

  // Availability Checkboxes
  document.getElementById("filter-instock")?.addEventListener("change", (e) => {
    inStockOnly = e.target.checked;
    renderCatalog();
  });

  document.getElementById("filter-onsale")?.addEventListener("change", (e) => {
    onSaleOnly = e.target.checked;
    renderCatalog();
  });

  // Sort dropdown
  document.getElementById("sort-select")?.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderCatalog();
  });

  // Reset Filters Button
  document.getElementById("reset-filters-btn")?.addEventListener("click", resetAllFilters);

  // View Mode Toggles (Grid vs List)
  document.getElementById("view-grid-btn")?.addEventListener("click", () => {
    isGridView = true;
    updateViewModeButtons();
    renderCatalog();
  });

  document.getElementById("view-list-btn")?.addEventListener("click", () => {
    isGridView = false;
    updateViewModeButtons();
    renderCatalog();
  });

  // Theme Toggles
  ["theme-toggle", "mobile-theme-toggle"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", toggleTheme);
  });
}

function setCatalogCategory(cat) {
  currentCategory = cat;
  currentSearchQuery = "";
  currentSearch = "";
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  document.getElementById("clear-search")?.classList.add("hidden");
  syncCategoryTabUI();
  renderCatalog();
}

function syncCategoryTabUI() {
  document.querySelectorAll(".cat-tab").forEach((tab) => {
    const tabCat = tab.getAttribute("data-category");
    if (tabCat === currentCategory && !currentSearch) {
      tab.classList.add("active", "bg-secondary", "text-white", "font-bold", "shadow-sm");
      tab.classList.remove("text-on-surface-variant", "hover:bg-surface-container");
    } else {
      tab.classList.remove("active", "bg-secondary", "text-white", "font-bold", "shadow-sm");
      tab.classList.add("text-on-surface-variant", "hover:bg-surface-container");
    }
  });

  const titleEl = document.getElementById("catalog-title");
  const breadcrumbEl = document.getElementById("catalog-breadcrumb");

  if (currentSearch) {
    const displayQ = currentSearchQuery || currentSearch;
    if (titleEl) titleEl.textContent = `search result for '${displayQ}'`;
    if (breadcrumbEl) breadcrumbEl.textContent = `Search: "${displayQ}"`;
  } else {
    const formatted = currentCategory === "all" ? "All Items" : currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    if (titleEl) titleEl.textContent = currentCategory === "all" ? "Catalog" : formatted;
    if (breadcrumbEl) breadcrumbEl.textContent = formatted;
  }
}

function updateViewModeButtons() {
  const gridBtn = document.getElementById("view-grid-btn");
  const listBtn = document.getElementById("view-list-btn");
  if (isGridView) {
    gridBtn?.classList.add("bg-secondary", "text-white");
    gridBtn?.classList.remove("text-outline");
    listBtn?.classList.remove("bg-secondary", "text-white");
    listBtn?.classList.add("text-outline");
  } else {
    listBtn?.classList.add("bg-secondary", "text-white");
    listBtn?.classList.remove("text-outline");
    gridBtn?.classList.remove("bg-secondary", "text-white");
    gridBtn?.classList.add("text-outline");
  }
}

function resetAllFilters() {
  currentCategory = "all";
  currentSearchQuery = "";
  currentSearch = "";
  currentMaxPrice = 1500;
  selectedBrands = [];
  inStockOnly = false;
  onSaleOnly = false;
  currentSort = "rating";

  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  document.getElementById("clear-search")?.classList.add("hidden");

  const slider = document.getElementById("price-range-slider");
  if (slider) slider.value = 1500;
  document.getElementById("price-max-display").textContent = "$1,500";

  document.querySelectorAll(".brand-checkbox").forEach((cb) => (cb.checked = false));
  const instockCb = document.getElementById("filter-instock");
  const onsaleCb = document.getElementById("filter-onsale");
  if (instockCb) instockCb.checked = false;
  if (onsaleCb) onsaleCb.checked = false;

  syncCategoryTabUI();
  renderCatalog();
}

function renderCatalog() {
  const productsGrid = document.getElementById("catalog-products-grid");
  if (!productsGrid) return;

  const products = window.lumenStore.getProducts(true);
  const wishlist = window.lumenStore.getWishlist();

  // Filter products
  let filtered = products.filter((p) => {
    const matchesCat = currentCategory === "all" || p.category.toLowerCase() === currentCategory.toLowerCase();
    const matchesSearch = !currentSearch || p.name.toLowerCase().includes(currentSearch) || p.description.toLowerCase().includes(currentSearch) || (p.brand && p.brand.toLowerCase().includes(currentSearch));
    const matchesPrice = p.price <= currentMaxPrice;
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const matchesStock = !inStockOnly || p.stock > 0;
    const matchesSale = !onSaleOnly || p.isSale;

    return matchesCat && matchesSearch && matchesPrice && matchesBrand && matchesStock && matchesSale;
  });

  // Sort products
  if (currentSort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (currentSort === "newest") {
    filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  // Update counts text
  const countText = document.getElementById("results-count-text");
  if (countText) countText.textContent = `Showing ${filtered.length} of ${products.length} products`;

  // Render Active Filter Chips
  renderActiveChips();

  if (filtered.length === 0) {
    productsGrid.className = "col-span-full py-16 text-center space-y-3 bg-surface-container-lowest dark:bg-slate-800 rounded-2xl border border-outline-variant/30";
    productsGrid.innerHTML = `
      <span class="material-symbols-outlined text-5xl text-outline">search_off</span>
      <h3 class="text-lg font-bold text-on-surface">No Products Match Your Criteria</h3>
      <p class="text-xs text-outline">Try adjusting your price range, clearing brand selections, or resetting filters.</p>
      <button onclick="resetAllFilters()" class="mt-2 bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
        Reset All Filters
      </button>
    `;
    return;
  }

  // Apply layout mode
  if (isGridView) {
    productsGrid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md";
    productsGrid.innerHTML = filtered.map((p) => renderGridProductCard(p, wishlist)).join("");
  } else {
    productsGrid.className = "flex flex-col gap-4";
    productsGrid.innerHTML = filtered.map((p) => renderListProductCard(p, wishlist)).join("");
  }

  if (window.refreshLumenAnimations) {
    window.refreshLumenAnimations();
  }
}

function renderGridProductCard(p, wishlist) {
  const isSaved = wishlist.includes(p.id);
  const mainImg = p.images ? p.images[0] : p.image;
  
  // Calculate discount badge text
  let discountBadge = "";
  if (p.originalPrice && p.originalPrice > p.price) {
    const pct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
    discountBadge = `<span class="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Sale ${pct}%</span>`;
  } else if (p.isNew) {
    discountBadge = `<span class="bg-secondary text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">New</span>`;
  }

  // Stock status text
  let stockBadge = "";
  if (p.stock <= 0) {
    stockBadge = `<span class="text-red-500 font-bold text-[11px]">Out of Stock</span>`;
  } else if (p.stock <= 3) {
    stockBadge = `<span class="text-amber-600 dark:text-amber-400 font-bold text-[11px]">Low Stock (${p.stock} left)</span>`;
  } else {
    stockBadge = `<span class="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">In Stock</span>`;
  }

  return `
    <div class="product-card spotlight-card bg-surface-container-lowest dark:bg-slate-800 rounded-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative border border-outline-variant/30 overflow-hidden">
      
      <!-- Full-bleed Product Image with Overlaid Badges -->
      <div class="relative w-full aspect-square bg-surface dark:bg-slate-700/40 overflow-hidden">
        <a href="product-detail.html?id=${p.id}" class="w-full h-full block">
          <img src="${mainImg}" alt="${p.name}" class="product-card-img object-cover h-full w-full transition-transform duration-300 group-hover:scale-105"/>
        </a>
        <div class="absolute top-2.5 left-2.5 z-10">${discountBadge}</div>
        <button onclick="toggleCatalogWishlist('${p.id}')" class="absolute top-2.5 right-2.5 z-10 text-outline hover:text-red-500 transition-all bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full p-1.5 shadow-xs hover:scale-110">
          <span class="material-symbols-outlined text-lg ${isSaved ? 'filled text-red-500' : ''}">favorite</span>
        </button>
      </div>

      <!-- Content Info matching Reference Design -->
      <div class="p-4 flex-grow flex flex-col justify-between space-y-2">
        <div>
          <!-- Brand & Rating Row -->
          <div class="flex justify-between items-center text-xs mb-1">
            <span class="font-bold text-outline uppercase tracking-wider text-xs">${p.brand || p.category}</span>
            <div class="flex items-center gap-1 font-bold text-on-surface text-xs">
              <span class="material-symbols-outlined text-xs text-amber-400 filled">star</span>
              <span>${p.rating}</span>
            </div>
          </div>

          <!-- Price & Old Price Row -->
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-black text-primary dark:text-white">$${p.price.toFixed(2)}</span>
            ${p.originalPrice ? `<span class="text-xs text-outline line-through">$${p.originalPrice.toFixed(2)}</span>` : ''}
          </div>

          <!-- Product Title -->
          <a href="product-detail.html?id=${p.id}" class="text-sm font-bold text-on-surface line-clamp-2 leading-snug hover:text-secondary transition-colors block mt-1">
            ${p.name}
          </a>
        </div>

        <!-- Stock Status & Add to Cart Action -->
        <div class="pt-2 flex items-center justify-between border-t border-outline-variant/20">
          <div>${stockBadge}</div>
          <button onclick="addCatalogCart('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''} 
                  class="bg-secondary hover:bg-secondary-container ${p.stock <= 0 ? 'opacity-40 cursor-not-allowed' : ''} text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
            <span>Add</span>
          </button>
        </div>

      </div>

    </div>
  `;
}

function renderListProductCard(p, wishlist) {
  const isSaved = wishlist.includes(p.id);
  const mainImg = p.images ? p.images[0] : p.image;

  return `
    <div class="bg-surface-container-lowest dark:bg-slate-800 rounded-none p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-4 border border-outline-variant/30">
      <a href="product-detail.html?id=${p.id}" class="w-full sm:w-36 h-36 bg-surface dark:bg-slate-700/40 rounded-none p-2 shrink-0 overflow-hidden flex items-center justify-center">
        <img src="${mainImg}" alt="${p.name}" class="object-cover h-full w-full rounded-none"/>
      </a>

      <div class="flex-grow space-y-2 w-full">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-secondary">${p.brand || p.category}</span>
            <a href="product-detail.html?id=${p.id}" class="text-lg font-bold text-on-surface hover:text-secondary transition-colors block">
              ${p.name}
            </a>
          </div>
          <button onclick="toggleCatalogWishlist('${p.id}')" class="text-outline hover:text-red-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full p-1.5">
            <span class="material-symbols-outlined text-lg ${isSaved ? 'filled text-red-500' : ''}">favorite</span>
          </button>
        </div>

        <p class="text-xs text-on-surface-variant line-clamp-2">${p.description}</p>

        <div class="flex items-center gap-3 pt-1">
          <div class="flex items-center gap-1 text-xs font-bold text-on-surface">
            <span class="material-symbols-outlined text-xs text-amber-400 filled">star</span>
            <span>${p.rating} (${p.reviewsCount})</span>
          </div>
          <span class="text-xs text-outline">•</span>
          <span class="text-xs text-emerald-600 font-bold">${p.stock} units in stock</span>
        </div>
      </div>

      <div class="flex sm:flex-col justify-between sm:justify-center items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-outline-variant/20 pt-3 sm:pt-0 sm:pl-4">
        <div class="text-left sm:text-right">
          <span class="text-xl font-black text-primary dark:text-white">$${p.price.toFixed(2)}</span>
          ${p.originalPrice ? `<div class="text-xs text-outline line-through">$${p.originalPrice.toFixed(2)}</div>` : ''}
        </div>
        <button onclick="addCatalogCart('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''} 
                class="bg-secondary hover:bg-secondary-container ${p.stock <= 0 ? 'opacity-40 cursor-not-allowed' : ''} text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function renderActiveChips() {
  const container = document.getElementById("active-filter-chips");
  const resetBtn = document.getElementById("reset-filters-btn");
  if (!container) return;

  const chips = [];
  if (currentCategory !== "all") chips.push({ label: `Category: ${currentCategory}`, type: "cat" });
  if (currentSearch) chips.push({ label: `Search: "${currentSearchQuery || currentSearch}"`, type: "search" });
  if (currentMaxPrice < 1500) chips.push({ label: `Under $${currentMaxPrice}`, type: "price" });
  selectedBrands.forEach((b) => chips.push({ label: b, type: "brand", val: b }));
  if (inStockOnly) chips.push({ label: "In Stock Only", type: "instock" });
  if (onSaleOnly) chips.push({ label: "On Sale Only", type: "onsale" });

  resetBtn?.classList.toggle("hidden", chips.length === 0);

  container.innerHTML = chips.map((c) => `
    <span class="inline-flex items-center gap-1 bg-surface dark:bg-slate-700 text-on-surface text-[11px] font-semibold px-2.5 py-1 rounded-full border border-outline-variant/40">
      ${c.label}
      <button onclick="removeChip('${c.type}', '${c.val || ''}')" class="hover:text-red-500 font-bold ml-0.5">×</button>
    </span>
  `).join("");
}

function removeChip(type, val) {
  if (type === "cat") setCatalogCategory("all");
  else if (type === "search") {
    currentSearchQuery = "";
    currentSearch = "";
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";
    document.getElementById("clear-search")?.classList.add("hidden");
    syncCategoryTabUI();
    renderCatalog();
  } else if (type === "price") {
    currentMaxPrice = 1500;
    const slider = document.getElementById("price-range-slider");
    if (slider) slider.value = 1500;
    document.getElementById("price-max-display").textContent = "$1,500";
  } else if (type === "brand") {
    selectedBrands = selectedBrands.filter((b) => b !== val);
    document.querySelectorAll(`.brand-checkbox[value="${val}"]`).forEach((cb) => (cb.checked = false));
  } else if (type === "instock") {
    inStockOnly = false;
    const cb = document.getElementById("filter-instock");
    if (cb) cb.checked = false;
  } else if (type === "onsale") {
    onSaleOnly = false;
    const cb = document.getElementById("filter-onsale");
    if (cb) cb.checked = false;
  }
  renderCatalog();
}

function addCatalogCart(productId) {
  const res = window.lumenStore.addToCart(productId, 1);
  if (res.success) {
    showToast(`Added "${res.item.name}" to cart!`, "cart");
    updateHeaderCounts();
  } else if (res.reason === "out_of_stock") {
    showToast("Sorry, this item is out of stock!", "info");
  } else if (res.reason === "exceeds_stock") {
    showToast(`Max stock limit (${res.maxStock}) reached!`, "info");
  }
}

function toggleCatalogWishlist(productId) {
  const res = window.lumenStore.toggleWishlist(productId);
  renderCatalog();
  updateHeaderCounts();
  showToast(res.added ? "Saved to wishlist!" : "Removed from wishlist", res.added ? "wishlist" : "info");
}

function updateHeaderCounts() {
  const cart = window.lumenStore.getCart();
  const totalCount = cart.length;

  ["cart-badge-count-desktop", "cart-badge-count-mobile", "cart-drawer-count"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = totalCount;
  });

  const wishlist = window.lumenStore.getWishlist();
  const wishEl = document.getElementById("wishlist-badge-count");
  if (wishEl) {
    wishEl.textContent = wishlist.length;
    wishEl.classList.toggle("hidden", wishlist.length === 0);
  }

  updateHoverModalContent(cart);
}

function setupCartDrawerListeners() {
  document.getElementById("checkout-btn")?.addEventListener("click", () => {
    const cart = window.lumenStore.getCart();
    if (cart.length === 0) {
      showToast("Your cart is empty!", "info");
      return;
    }
    window.location.href = "checkout.html";
  });
}

function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  const panel = document.getElementById("cart-panel");

  if (drawer && backdrop && panel) {
    drawer.classList.remove("pointer-events-none");
    backdrop.classList.remove("pointer-events-none", "opacity-0");
    backdrop.classList.add("opacity-100");
    panel.classList.remove("translate-x-full");
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  const panel = document.getElementById("cart-panel");

  if (drawer && backdrop && panel) {
    panel.classList.add("translate-x-full");
    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");
    setTimeout(() => {
      drawer.classList.add("pointer-events-none");
    }, 300);
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");

  let icon = "info";
  let bgClass = "bg-slate-900 text-white";
  if (type === "cart") {
    icon = "check_circle";
    bgClass = "bg-secondary text-white";
  } else if (type === "wishlist") {
    icon = "favorite";
    bgClass = "bg-pink-600 text-white";
  } else if (type === "success") {
    icon = "verified";
    bgClass = "bg-emerald-600 text-white";
  }

  toast.className = `toast-animate-in ${bgClass} px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold max-w-sm pointer-events-auto`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-base">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("toast-animate-in");
    toast.classList.add("toast-animate-out");
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

function initTheme() {
  const savedTheme = localStorage.getItem("lumen_theme") || "light";
  const isDark = savedTheme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
  const label = document.getElementById("theme-toggle-label");
  if (label) label.textContent = isDark ? "Light Mode" : "Dark Mode";
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  document.documentElement.classList.toggle("dark", newTheme === "dark");
  document.documentElement.classList.toggle("light", newTheme !== "dark");
  localStorage.setItem("lumen_theme", newTheme);
  const label = document.getElementById("theme-toggle-label");
  if (label) label.textContent = newTheme === "dark" ? "Light Mode" : "Dark Mode";
  showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} mode`, "info");
}

function setupLiveSearch() {
  const searchInput = document.getElementById("search-input");
  const dropdown = document.getElementById("search-results-dropdown");
  const clearSearchBtn = document.getElementById("clear-search");
  if (!searchInput || !dropdown) return;

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (clearSearchBtn) clearSearchBtn.classList.toggle("hidden", !q);

    if (!q || q.length < 1) {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      return;
    }

    const products = window.lumenStore.getProducts(true);
    const matches = products.filter((p) => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q)
    ).slice(0, 5);

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div class="p-4 text-center text-xs text-outline font-semibold">
          No matching products found for "${q}"
        </div>
      `;
    } else {
      dropdown.innerHTML = matches.map((p) => {
        const mainImg = p.images ? p.images[0] : p.image;
        return `
          <a href="product-detail.html?id=${p.id}" class="flex items-center justify-between p-3 hover:bg-surface-container-low dark:hover:bg-slate-700/60 transition group cursor-pointer border-b border-outline-variant/10 last:border-0">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-surface dark:bg-slate-700 p-1 shrink-0 flex items-center justify-center overflow-hidden border border-outline-variant/30">
                <img src="${mainImg}" alt="${p.name}" class="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-200"/>
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-on-surface truncate group-hover:text-secondary transition">${p.name}</h4>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <div class="flex text-emerald-600 dark:text-emerald-400 text-xs font-extrabold tracking-tighter">
                    ★★★★★
                  </div>
                  <span class="text-xs font-bold text-on-surface">(${p.reviewsCount || 121})</span>
                </div>
              </div>
            </div>
            <span class="text-sm font-black text-primary dark:text-white shrink-0 ml-3">$${p.price.toFixed(2)}</span>
          </a>
        `;
      }).join("") + `
        <a href="products.html?search=${encodeURIComponent(q)}" class="block py-2.5 px-4 text-center text-xs font-bold text-secondary bg-surface-container-low dark:bg-slate-800/90 hover:underline">
          View all results for "${q}" →
        </a>
      `;
    }

    dropdown.classList.remove("hidden");
  };

  searchInput.addEventListener("input", handleSearch);
  searchInput.addEventListener("focus", handleSearch);

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = searchInput.value.trim();
      dropdown.classList.add("hidden");
      currentSearchQuery = q;
      currentSearch = q.toLowerCase();
      syncCategoryTabUI();
      renderCatalog();
    }
  });

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearSearchBtn.classList.add("hidden");
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
    });
  }
}

function setupHoverCartModal() {
  const container = document.getElementById("cart-hover-container");
  const modal = document.getElementById("cart-hover-modal");
  if (!container || !modal) return;

  let hideTimeout;

  container.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
    updateHoverModalContent(window.lumenStore.getCart());
    modal.classList.remove("hidden");
  });

  container.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(() => {
      modal.classList.add("hidden");
    }, 200);
  });

  document.getElementById("hover-checkout-btn")?.addEventListener("click", () => {
    const cart = window.lumenStore.getCart();
    if (cart.length === 0) {
      showToast("Your cart is empty!", "info");
      return;
    }
    window.location.href = "checkout.html";
  });
}

function updateHoverModalContent(cart) {
  const itemsContainer = document.getElementById("hover-cart-items");
  const countEl = document.getElementById("hover-cart-count");
  const subtotalEl = document.getElementById("hover-cart-subtotal");
  const totalEl = document.getElementById("hover-cart-total");
  if (!itemsContainer || !countEl) return;

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal;

  countEl.textContent = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${totalAmount.toFixed(2)}`;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="py-6 text-center text-xs text-outline font-semibold flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-3xl text-outline">shopping_bag</span>
        <span>Your cart is empty</span>
      </div>
    `;
    return;
  }

  itemsContainer.innerHTML = cart.slice(0, 5).map((item) => `
    <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-surface dark:bg-slate-800 border border-outline-variant/20">
      <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-11 h-11 object-cover rounded-lg shrink-0"/>
      <div class="min-w-0 flex-grow">
        <h5 class="text-xs font-bold text-on-surface truncate">${item.name}</h5>
        <div class="flex items-center gap-2 mt-1">
          <div class="flex items-center gap-1">
            <button onclick="handleHoverCartQty('${item.id}', -1)" class="w-5 h-5 rounded bg-surface-container hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-on-surface transition">-</button>
            <span class="text-xs font-extrabold px-1">${item.quantity}</span>
            <button onclick="handleHoverCartQty('${item.id}', 1)" class="w-5 h-5 rounded bg-surface-container hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-on-surface transition">+</button>
          </div>
          <span class="text-xs text-secondary font-extrabold ml-auto">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
      <button onclick="handleHoverRemoveCart('${item.id}')" class="text-outline hover:text-red-500 p-1" title="Remove Product">
        <span class="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  `).join("");
}

function handleHoverCartQty(id, delta) {
  window.lumenStore.updateCartQuantity(id, delta);
  updateHeaderCounts();
}

function handleHoverRemoveCart(id) {
  window.lumenStore.removeFromCart(id);
  updateHeaderCounts();
}
