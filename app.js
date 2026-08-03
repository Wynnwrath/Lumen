// Lumen Home Page Controller connected to store.js

let currentCategory = "all";
let currentSearch = "";
let currentSort = "featured";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderProducts();
  setupEventListeners();
  updateHeaderCounts();
});

function setupEventListeners() {
  setupLiveSearch();
  setupHoverCartModal();

  // Category navigation buttons navigate directly to products.html?category=...
  document.querySelectorAll(".category-nav-btn, .category-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-category");
      if (cat === "all") {
        window.location.href = "index.html";
      } else if (cat) {
        window.location.href = `products.html?category=${encodeURIComponent(cat)}`;
      } else {
        window.location.href = "products.html";
      }
    });
  });

  // Navigation / Cart Actions
  document.getElementById("checkout-btn")?.addEventListener("click", handleCheckout);

  // Newsletter submission
  document.getElementById("newsletter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Thank you for subscribing to Lumen!", "success");
    e.target.reset();
  });

  // Theme Toggles
  ["theme-toggle", "mobile-theme-toggle"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", toggleTheme);
  });

  bindHomeControls();
}

function setCategory(category) {
  currentCategory = category;
  document.querySelectorAll(".category-nav-btn").forEach((btn) => {
    const btnCat = btn.getAttribute("data-category");
    if (btnCat === category) {
      btn.classList.add("text-secondary", "dark:text-secondary-fixed-dim", "font-bold", "border-b-2", "border-secondary");
      btn.classList.remove("text-on-surface-variant", "dark:text-outline-variant");
    } else {
      btn.classList.remove("text-secondary", "dark:text-secondary-fixed-dim", "font-bold", "border-b-2", "border-secondary");
      btn.classList.add("text-on-surface-variant", "dark:text-outline-variant");
    }
  });

  const sectionTitle = document.getElementById("section-title");
  const sectionSubtitle = document.getElementById("section-subtitle");
  
  if (category === "all") {
    if (sectionTitle) sectionTitle.textContent = "Today's Best Deals For You";
    if (sectionSubtitle) sectionSubtitle.textContent = "Unbeatable prices on premium quality products";
  } else {
    const formattedCat = category.charAt(0).toUpperCase() + category.slice(1);
    if (sectionTitle) sectionTitle.textContent = `${formattedCat} Collection`;
    if (sectionSubtitle) sectionSubtitle.textContent = `Showing all products in ${formattedCat}`;
  }

  renderProducts();
}

function renderProducts() {
  const productsGrid = document.getElementById("products-grid");
  if (!productsGrid) return;

  const products = window.lumenStore.getProducts(true);
  const wishlist = window.lumenStore.getWishlist();

  // Preview top 4 products on landing page
  const previewProducts = products.slice(0, 4);

  productsGrid.innerHTML = previewProducts.map((p) => {
    const isSaved = wishlist.includes(p.id);
    const mainImg = p.images ? p.images[0] : p.image;
    
    // Stock badge display
    let stockBadge = "";
    if (p.stock <= 0) {
      stockBadge = `<span class="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Out of Stock</span>`;
    } else if (p.stock <= 3) {
      stockBadge = `<span class="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Only ${p.stock} Left</span>`;
    } else if (p.isNew) {
      stockBadge = `<span class="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New</span>`;
    } else if (p.isSale) {
      stockBadge = `<span class="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Sale</span>`;
    }

    return `
      <div class="product-card spotlight-card bg-surface-container-lowest dark:bg-slate-800 rounded-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative border border-outline-variant/30 overflow-hidden">
        
        <!-- Full-bleed Image Container with overlaid Badges & Wishlist -->
        <div class="relative w-full aspect-square bg-surface-container dark:bg-slate-700/50 overflow-hidden">
          <a href="product-detail.html?id=${p.id}" class="w-full h-full block">
            <img src="${mainImg}" alt="${p.name}" class="product-card-img object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"/>
          </a>
          <div class="absolute top-2.5 left-2.5 z-10">${stockBadge}</div>
          <button onclick="toggleHomeWishlist('${p.id}')" class="absolute top-2.5 right-2.5 z-10 text-outline hover:text-red-500 transition-all bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full p-1.5 shadow-xs hover:scale-110">
            <span class="material-symbols-outlined text-lg ${isSaved ? 'filled text-red-500' : ''}">favorite</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 flex-grow flex flex-col justify-between space-y-2">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-secondary">${p.category}</span>
            <a href="product-detail.html?id=${p.id}" class="text-base font-bold text-on-surface line-clamp-2 leading-snug hover:text-secondary transition-colors block mt-0.5">
              ${p.name}
            </a>
            
            <!-- Rating -->
            <div class="flex items-center gap-1.5 mt-1">
              <div class="flex text-amber-400 text-xs">
                <span class="material-symbols-outlined text-sm filled">star</span>
              </div>
              <span class="text-xs font-bold text-on-surface">${p.rating}</span>
              <span class="text-xs text-outline font-medium">(${p.reviewsCount})</span>
            </div>
          </div>

          <!-- Price & Actions -->
          <div class="pt-2 flex items-center justify-between border-t border-outline-variant/20">
            <div>
              <span class="text-base font-extrabold text-primary dark:text-white">$${p.price.toFixed(2)}</span>
              ${p.originalPrice ? `<span class="text-xs text-outline line-through ml-1">$${p.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <div class="flex gap-1">
              <a href="product-detail.html?id=${p.id}" class="bg-surface-container hover:bg-slate-300 dark:hover:bg-slate-700 text-on-surface p-2 rounded-xl text-xs font-semibold transition" title="View Details">
                <span class="material-symbols-outlined text-base">visibility</span>
              </a>
              <button onclick="addHomeCart('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''} class="bg-secondary hover:bg-secondary-container ${p.stock <= 0 ? 'opacity-40 cursor-not-allowed' : ''} text-white p-2 rounded-xl transition-all active:scale-95 shadow-sm" title="Add to Cart">
                <span class="material-symbols-outlined text-base">add_shopping_cart</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  }).join("");

  if (window.refreshLumenAnimations) {
    window.refreshLumenAnimations();
  }
}

function addHomeCart(productId) {
  const res = window.lumenStore.addToCart(productId, 1);
  if (res.success) {
    showToast(`Added "${res.item.name}" to cart!`, "cart");
    updateHeaderCounts();
  } else if (res.reason === "out_of_stock") {
    showToast("Sorry, this item is out of stock!", "info");
  } else if (res.reason === "exceeds_stock") {
    showToast(`Cannot add more. Max available stock is ${res.maxStock}!`, "info");
  }
}

function toggleHomeWishlist(productId) {
  const res = window.lumenStore.toggleWishlist(productId);
  renderProducts();
  updateHeaderCounts();
  showToast(res.added ? "Saved to wishlist!" : "Removed from wishlist", res.added ? "wishlist" : "info");
}

// Wire home-page-specific controls that previously had no JS handler.
function bindHomeControls() {
  // Hero "Shop Now" → add featured product to cart, then go to checkout
  document.querySelectorAll(".quick-buy-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id") || "p1";
      const res = window.lumenStore.addToCart(id, 1);
      if (res && res.success) {
        showToast(`Added "${res.item.name}" — proceeding to checkout!`, "cart");
        updateHeaderCounts();
        window.location.href = "checkout.html";
      } else if (res && res.reason === "out_of_stock") {
        showToast("Sorry, this item is out of stock!", "info");
      }
    });
  });

  // Hero "Learn More" -> open product modal for the featured product
  document.querySelectorAll(".view-details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openProductModal(btn.getAttribute("data-id") || "p1");
    });
  });

  // Close modal button + backdrop click + Escape
  const closeBtn = document.getElementById("close-modal-btn");
  if (closeBtn) closeBtn.addEventListener("click", closeProductModal);
  const modal = document.getElementById("product-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeProductModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProductModal();
  });

  // Wishlist header icons (desktop + mobile dock) -> toggle featured product
  document.querySelectorAll("#wishlist-btn-desktop, #wishlist-btn-mobile").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleHomeWishlist("p1");
    });
  });

  // Cart dock button -> checkout (with empty-cart guard)
  const cartDock = document.getElementById("cart-icon-btn-dock");
  if (cartDock) {
    cartDock.addEventListener("click", (e) => {
      e.preventDefault();
      const cart = window.lumenStore.getCart();
      if (!cart || cart.length === 0) {
        showToast("Your cart is empty!", "info");
      } else {
        window.location.href = "checkout.html";
      }
    });
  }

  // "View All" reset button
  const resetBtn = document.getElementById("reset-category-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "products.html";
    });
  }

  // Homepage sort dropdown -> catalog with the chosen sort
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      window.location.href = `products.html?sort=${encodeURIComponent(sortSelect.value)}`;
    });
  }
}

// Open product quick-view modal populated from the store.
function openProductModal(productId) {
  const modal = document.getElementById("product-modal");
  const modalBody = document.getElementById("modal-body");
  if (!modal || !modalBody) return;

  const p = window.lumenStore.getProductById(productId);
  if (!p) return;

  const mainImg = p.images ? p.images[0] : p.image;
  const stockNote =
    p.stock <= 0
      ? `<span class="text-[10px] font-bold uppercase tracking-wider text-red-500">Out of Stock</span>`
      : `<span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">In Stock (${p.stock} left)</span>`;

  modalBody.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <img src="${mainImg}" alt="${p.name}" class="w-full max-w-[240px] aspect-square object-cover rounded-2xl bg-surface-container"/>
      <div class="flex-1 min-w-0">
        <span class="text-[10px] font-bold uppercase tracking-wider text-secondary">${p.category}</span>
        <h3 class="text-lg font-extrabold text-on-surface mt-1">${p.name}</h3>
        <div class="flex items-center gap-1 mt-1 text-amber-400">
          <span class="material-symbols-outlined text-sm filled">star</span>
          <span class="text-xs font-bold text-on-surface">${p.rating}</span>
          <span class="text-[11px] text-outline">(${p.reviewsCount} reviews)</span>
        </div>
        <div class="mt-3 text-2xl font-black text-primary dark:text-white">$${p.price.toFixed(2)}
          ${p.originalPrice ? `<span class="text-sm text-outline line-through ml-1">$${p.originalPrice.toFixed(2)}</span>` : ''}
        </div>
        <p class="mt-2 text-xs text-on-surface-variant line-clamp-3">${p.description}</p>
        <div class="mt-3">${stockNote}</div>
        <div class="mt-4 flex items-center gap-2">
          <button id="modal-add-to-cart" ${p.stock <= 0 ? 'disabled' : ''} class="flex-1 bg-secondary hover:bg-secondary-container text-white px-4 py-2.5 rounded-xl font-bold text-sm transition active:scale-95">Add to Cart</button>
          <a href="product-detail.html?id=${p.id}" class="bg-surface-container hover:bg-slate-300 dark:hover:bg-slate-700 text-on-surface px-4 py-2.5 rounded-xl font-bold text-sm transition">View Details</a>
        </div>
      </div>
    </div>
  `;

  const addBtn = document.getElementById("modal-add-to-cart");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const res = window.lumenStore.addToCart(p.id, 1);
      showToast(res.success ? `Added "${res.item.name}" to cart!` : "Could not add item.", res.success ? "cart" : "info");
      updateHeaderCounts();
    });
  }

  modal.classList.remove("hidden");
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.classList.add("hidden");
}

function updateHeaderCounts() {
  const cart = window.lumenStore.getCart();
  const totalCount = cart.length;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  ["cart-badge-count-desktop", "cart-badge-count-mobile", "cart-badge-count-dock", "cart-drawer-count"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = totalCount;
  });

  const wishlist = window.lumenStore.getWishlist();
  const wishEl = document.getElementById("wishlist-badge-count");
  if (wishEl) {
    wishEl.textContent = wishlist.length;
    wishEl.classList.toggle("hidden", wishlist.length === 0);
  }
  const wishMobileEl = document.getElementById("wishlist-badge-count-mobile");
  if (wishMobileEl) {
    wishMobileEl.textContent = wishlist.length;
    wishMobileEl.classList.toggle("hidden", wishlist.length === 0);
  }

  updateHoverModalContent(cart);
}

function renderCartItems(cart, subtotal) {
  const container = document.getElementById("cart-items-container");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center space-y-3">
        <span class="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
        <p class="text-sm font-semibold text-on-surface">Your cart is empty</p>
      </div>
    `;
  } else {
    container.innerHTML = cart.map((item) => `
      <div class="flex items-center gap-3 p-3 bg-surface dark:bg-slate-800 rounded-xl border border-outline-variant/30">
        <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg"/>
        <div class="flex-grow min-w-0">
          <h4 class="text-xs font-semibold text-on-surface truncate">${item.name}</h4>
          <p class="text-xs font-extrabold text-secondary dark:text-secondary-fixed mt-0.5">$${(item.price * item.quantity).toFixed(2)}</p>
          <div class="flex items-center gap-2 mt-2">
            <button onclick="handleCartQty('${item.id}', -1)" class="w-5 h-5 rounded bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface">-</button>
            <span class="text-xs font-bold px-1">${item.quantity}</span>
            <button onclick="handleCartQty('${item.id}', 1)" class="w-5 h-5 rounded bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface">+</button>
          </div>
        </div>
        <button onclick="handleRemoveCart('${item.id}')" class="text-outline hover:text-red-500 p-1">
          <span class="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    `).join("");
  }

  const cartSubtotal = document.getElementById("cart-subtotal");
  const cartTotal = document.getElementById("cart-total");
  if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (cartTotal) cartTotal.textContent = `$${subtotal.toFixed(2)}`;

  const freeBar = document.getElementById("free-shipping-bar");
  const freeTxt = document.getElementById("free-shipping-text");
  const freePct = document.getElementById("free-shipping-percent");
  if (freeBar && freeTxt && freePct) {
    if (subtotal >= 100) {
      freeBar.style.width = "100%";
      freePct.textContent = "100%";
      freeTxt.textContent = "🎉 Free Express Shipping earned!";
    } else {
      const pct = Math.round((subtotal / 100) * 100);
      freeBar.style.width = `${pct}%`;
      freePct.textContent = `${pct}%`;
      freeTxt.textContent = `Add $${(100 - subtotal).toFixed(2)} more for FREE Shipping!`;
    }
  }
}

function handleCartQty(id, delta) {
  window.lumenStore.updateCartQuantity(id, delta);
  updateHeaderCounts();
}

function handleRemoveCart(id) {
  window.lumenStore.removeFromCart(id);
  updateHeaderCounts();
}

function handleCheckout() {
  const cart = window.lumenStore.getCart();
  if (cart.length === 0) {
    showToast("Your cart is empty!", "info");
    return;
  }
  window.location.href = "cart.html?checkout=true";
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

    const products = window.lumenStore.getProducts();
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
      const q = searchInput.value.trim();
      if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
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
  const totalAmount = subtotal; // Total amount display

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
