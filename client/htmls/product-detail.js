// Product Detail Page Controller

let currentProduct = null;
let currentQuantity = 1;
let selectedImageIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  initProductDetail();
  setupCartDrawerListeners();
  updateHeaderCounts();
});

function initProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id") || "p1";

  currentProduct = window.lumenStore.getProductById(productId);
  if (!currentProduct) {
    window.location.href = "index.html";
    return;
  }

  renderProductDetails();
  renderRelatedProducts();
  setupInteractions();
}

function renderProductDetails() {
  const p = currentProduct;

  // Document title
  document.title = `${p.name} - Lumen`;

  // Breadcrumbs
  document.getElementById("breadcrumb-category").textContent = p.category;
  document.getElementById("breadcrumb-title").textContent = p.name;

  // Header info
  document.getElementById("product-category-badge").textContent = p.category;
  document.getElementById("product-brand").textContent = `By ${p.brand || 'Lumen'}`;
  document.getElementById("product-title").textContent = p.name;
  document.getElementById("product-rating-score").textContent = p.rating;
  document.getElementById("product-reviews-link").textContent = `(${p.reviewsCount.toLocaleString()} verified reviews)`;
  document.getElementById("product-description").textContent = p.description;

  // Pricing & Discounts
  document.getElementById("product-price").textContent = `$${p.price.toFixed(2)}`;
  if (p.originalPrice && p.originalPrice > p.price) {
    document.getElementById("product-original-price").textContent = `$${p.originalPrice.toFixed(2)}`;
    const discountPct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
    document.getElementById("product-savings-tag").textContent = `Save ${discountPct}% OFF`;
    document.getElementById("product-savings-tag").classList.remove("hidden");
  } else {
    document.getElementById("product-original-price").textContent = "";
    document.getElementById("product-savings-tag").classList.add("hidden");
  }

  // Stock status badge
  const stockContainer = document.getElementById("stock-status-container");
  if (p.stock <= 0) {
    stockContainer.innerHTML = `
      <span class="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-extrabold px-3 py-1.5 rounded-full">
        <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Out of Stock
      </span>
    `;
    disableAddToCart();
  } else if (p.stock <= 3) {
    stockContainer.innerHTML = `
      <span class="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold px-3 py-1.5 rounded-full">
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Low Stock: Only ${p.stock} left!
      </span>
    `;
  } else {
    stockContainer.innerHTML = `
      <span class="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold px-3 py-1.5 rounded-full">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> In Stock (${p.stock} units available)
      </span>
    `;
  }

  // Images & Gallery
  const images = p.images && p.images.length > 0 ? p.images : [p.image];
  selectedImageIndex = 0;
  updateMainImage(images[selectedImageIndex]);

  const thumbGallery = document.getElementById("thumbnail-gallery");
  if (images.length > 1) {
    thumbGallery.innerHTML = images.map((img, idx) => `
      <button onclick="selectGalleryImage(${idx})" class="w-20 h-20 rounded-none overflow-hidden border-2 ${idx === 0 ? 'border-secondary' : 'border-transparent opacity-60 hover:opacity-100'} transition-all shrink-0">
        <img src="${img}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover"/>
      </button>
    `).join("");
  } else {
    thumbGallery.innerHTML = "";
  }

  // Technical Specifications Table
  const specsTableBody = document.getElementById("specs-table-body");
  if (p.specs && Object.keys(p.specs).length > 0) {
    specsTableBody.innerHTML = Object.entries(p.specs).map(([key, val]) => `
      <tr class="hover:bg-surface-container/50 transition">
        <td class="py-3 px-4 font-bold text-on-surface w-1/3 bg-surface/50 dark:bg-slate-800/40">${key}</td>
        <td class="py-3 px-4 text-on-surface-variant">${val}</td>
      </tr>
    `).join("");
  } else {
    specsTableBody.innerHTML = `
      <tr>
        <td class="py-3 px-4 text-outline" colspan="2">Standard product specifications apply.</td>
      </tr>
    `;
  }

  // Wishlist heart status
  updateWishlistButton();
}

function updateMainImage(url) {
  const mainImg = document.getElementById("main-product-image");
  mainImg.src = url;
}

function selectGalleryImage(index) {
  selectedImageIndex = index;
  const images = currentProduct.images;
  updateMainImage(images[index]);

  const thumbBtns = document.getElementById("thumbnail-gallery").querySelectorAll("button");
  thumbBtns.forEach((btn, idx) => {
    if (idx === index) {
      btn.classList.add("border-secondary", "opacity-100");
      btn.classList.remove("border-transparent", "opacity-60");
    } else {
      btn.classList.remove("border-secondary", "opacity-100");
      btn.classList.add("border-transparent", "opacity-60");
    }
  });
}

function setupInteractions() {
  setupLiveSearch();
  setupHoverCartModal();

  // Quantity buttons
  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");
  const qtyVal = document.getElementById("qty-val");

  qtyMinus.addEventListener("click", () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      qtyVal.textContent = currentQuantity;
    }
  });

  qtyPlus.addEventListener("click", () => {
    if (currentQuantity < currentProduct.stock) {
      currentQuantity++;
      qtyVal.textContent = currentQuantity;
    } else {
      showToast(`Only ${currentProduct.stock} units available in stock!`, "info");
    }
  });

  // Add to Cart
  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    if (currentProduct.stock <= 0) return;
    const result = window.lumenStore.addToCart(currentProduct.id, currentQuantity);
    if (result.success) {
      showToast(`Added ${currentQuantity} x "${currentProduct.name}" to cart!`, "cart");
      updateHeaderCounts();
    } else if (result.reason === "exceeds_stock") {
      showToast(`Cannot add more. Max stock limit (${result.maxStock}) reached!`, "info");
    }
  });

  // Buy Now
  document.getElementById("buy-now-btn").addEventListener("click", () => {
    if (currentProduct.stock <= 0) return;
    window.lumenStore.addToCart(currentProduct.id, currentQuantity);
    updateHeaderCounts();
    window.location.href = "checkout.html";
  });

  // Wishlist toggle
  document.getElementById("wishlist-toggle-btn").addEventListener("click", () => {
    const res = window.lumenStore.toggleWishlist(currentProduct.id);
    updateWishlistButton();
    updateHeaderCounts();
    showToast(res.added ? "Saved to wishlist!" : "Removed from wishlist", res.added ? "wishlist" : "info");
  });

  // Theme Toggles
  ["theme-toggle", "mobile-theme-toggle"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark", !isDark);
      document.documentElement.classList.toggle("light", isDark);
      const label = document.getElementById("theme-toggle-label");
      if (label) label.textContent = isDark ? "Dark Mode" : "Light Mode";
    });
  });
}

function disableAddToCart() {
  const btn = document.getElementById("add-to-cart-btn");
  btn.disabled = true;
  btn.classList.add("opacity-50", "cursor-not-allowed");
  btn.innerHTML = `<span class="material-symbols-outlined text-lg">block</span> Out of Stock`;

  const buyBtn = document.getElementById("buy-now-btn");
  buyBtn.disabled = true;
  buyBtn.classList.add("opacity-50", "cursor-not-allowed");
}

function updateWishlistButton() {
  const wishlist = window.lumenStore.getWishlist();
  const isSaved = wishlist.includes(currentProduct.id);
  const icon = document.getElementById("wishlist-icon");
  if (isSaved) {
    icon.classList.add("filled", "text-red-500");
  } else {
    icon.classList.remove("filled", "text-red-500");
  }
}

function renderRelatedProducts() {
  const allProducts = window.lumenStore.getProducts();
  const related = allProducts.filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 4);

  const container = document.getElementById("related-products-grid");
  if (related.length === 0) {
    container.innerHTML = `<p class="col-span-full text-xs text-outline">No related products found in this category.</p>`;
    return;
  }

  container.innerHTML = related.map((p) => `
    <div class="product-card bg-surface-container-lowest dark:bg-slate-800 rounded-none shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group border border-outline-variant/30 overflow-hidden">
      <div class="relative w-full aspect-square bg-surface-container dark:bg-slate-700/50 overflow-hidden">
        <a href="product-detail.html?id=${p.id}" class="w-full h-full block">
          <img src="${p.images ? p.images[0] : p.image}" alt="${p.name}" class="product-card-img object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"/>
        </a>
      </div>
      <div class="p-4 flex-grow flex flex-col justify-between space-y-2">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-secondary">${p.category}</span>
          <a href="product-detail.html?id=${p.id}" class="text-sm font-bold text-on-surface line-clamp-2 leading-snug hover:text-secondary transition-colors block mt-0.5">
            ${p.name}
          </a>
        </div>
        <div class="pt-2 flex items-center justify-between border-t border-outline-variant/20">
          <span class="text-sm font-extrabold text-primary dark:text-white">$${p.price.toFixed(2)}</span>
          <a href="product-detail.html?id=${p.id}" class="bg-secondary/10 hover:bg-secondary text-secondary hover:text-white p-2 rounded-xl text-xs font-bold transition">
            View
          </a>
        </div>
      </div>
    </div>
  `).join("");
}

// Header & Cart Sync
function updateHeaderCounts() {
  const cart = window.lumenStore.getCart();
  const totalCount = cart.length;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  renderCartItems(cart, subtotal);
  updateHoverModalContent(cart);
}

function renderCartItems(cart, subtotal) {
  const container = document.getElementById("cart-items-container");
  if (!container) return; // only present on cart.html, not on this page
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

  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;

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

function setupCartDrawerListeners() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  const panel = document.getElementById("cart-panel");
  const closeBtn = document.getElementById("close-cart-btn");
  const checkoutBtn = document.getElementById("checkout-btn");
  const drawerOpenTargets = document.getElementById("cart-backdrop");

  ["cart-icon-btn-desktop", "cart-icon-btn-mobile"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      // cart drawer UI is not present on this page; nothing to open
    });
  });

  if (closeBtn && drawerOpenTargets) {
    closeBtn.addEventListener("click", closeCartDrawer);
    drawerOpenTargets.addEventListener("click", closeCartDrawer);
  }

  checkoutBtn?.addEventListener("click", () => {
    const cart = window.lumenStore.getCart();
    if (cart.length === 0) {
      showToast("Your cart is empty!", "info");
      return;
    }
    window.location.href = "cart.html?checkout=true";
  });
}

function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  const panel = document.getElementById("cart-panel");

  drawer.classList.remove("pointer-events-none");
  backdrop.classList.remove("pointer-events-none", "opacity-0");
  backdrop.classList.add("opacity-100");
  panel.classList.remove("translate-x-full");
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  const panel = document.getElementById("cart-panel");

  panel.classList.add("translate-x-full");
  backdrop.classList.remove("opacity-100");
  backdrop.classList.add("opacity-0");
  setTimeout(() => {
    drawer.classList.add("pointer-events-none");
  }, 300);
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
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
                <h4 class="text-xs font-bold text-on-surface truncate group-hover:text-secondary transition">${p.name}</h4>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <div class="flex text-emerald-600 dark:text-emerald-400 text-xs font-extrabold tracking-tighter">
                    ★★★★★
                  </div>
                  <span class="text-[11px] font-bold text-on-surface">(${p.reviewsCount || 121})</span>
                </div>
              </div>
            </div>
            <span class="text-xs font-black text-primary dark:text-white shrink-0 ml-3">$${p.price.toFixed(2)}</span>
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
