// Shopping Cart Page Controller

let appliedPromo = null;

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  setupCartPageListeners();
  setupLiveSearch();
  setupHoverCartModal();
  updateHeaderCounts();
});

function renderCartPage() {
  const cart = window.lumenStore.getCart();
  const container = document.getElementById("cart-page-items-container");
  const countHead = document.getElementById("cart-item-count-head");

  const totalCount = cart.length;
  if (countHead) countHead.textContent = totalCount;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto text-outline">
          <span class="material-symbols-outlined text-4xl">shopping_cart</span>
        </div>
        <h3 class="text-lg font-bold text-on-surface">Your Shopping Cart is Empty</h3>
        <p class="text-xs text-outline max-w-sm mx-auto">Explore our catalog to add tech, fashion, and home goods to your cart!</p>
        <a href="products.html" class="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-secondary-container transition">
          Browse Products <span class="material-symbols-outlined text-sm">east</span>
        </a>
      </div>
    `;
    updateSummary(0);
    return;
  }

  container.innerHTML = cart.map((item) => {
    const mainImg = item.images ? item.images[0] : item.image;
    const lineTotal = item.price * item.quantity;
    return `
      <div class="flex flex-col sm:flex-row items-center justify-between p-4 bg-surface dark:bg-slate-700/50 rounded-xl border border-outline-variant/30 gap-4 group">
        <div class="flex items-center gap-4 min-w-0 w-full sm:w-auto">
          <a href="product-detail.html?id=${item.id}" class="w-20 h-20 rounded-xl bg-surface-container dark:bg-slate-700 p-2 shrink-0 flex items-center justify-center overflow-hidden border border-outline-variant/20">
            <img src="${mainImg}" alt="${item.name}" class="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"/>
          </a>
          <div class="min-w-0 flex-grow space-y-1">
            <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">${item.category}</span>
            <a href="product-detail.html?id=${item.id}" class="text-sm font-bold text-on-surface block hover:text-secondary truncate">
              ${item.name}
            </a>
            <div class="text-xs text-outline font-semibold">Unit Price: <span class="text-on-surface font-extrabold">$${item.price.toFixed(2)}</span></div>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-outline-variant/20">
          <div class="flex items-center border border-outline-variant/50 rounded-xl bg-surface-container-lowest dark:bg-slate-800 p-1">
            <button onclick="handleCartPageQty('${item.id}', -1)" class="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-xs font-black text-on-surface">-</button>
            <span class="w-8 text-center text-xs font-extrabold text-on-surface">${item.quantity}</span>
            <button onclick="handleCartPageQty('${item.id}', 1)" class="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-xs font-black text-on-surface">+</button>
          </div>

          <div class="text-right min-w-[80px]">
            <span class="text-xs font-extrabold text-outline block sm:hidden">Total</span>
            <span class="text-base font-black text-primary dark:text-white">$${lineTotal.toFixed(2)}</span>
          </div>

          <button onclick="handleCartPageRemove('${item.id}')" class="text-outline hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition" title="Remove item">
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  updateSummary(subtotal);
}

function updateSummary(subtotal) {
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 12.00;
  
  let discount = 0;
  if (appliedPromo === "LUMEN20") {
    discount = subtotal * 0.20;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + shipping + tax;

  document.getElementById("summary-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-shipping").textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
  document.getElementById("summary-tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;

  const discountRow = document.getElementById("summary-discount-row");
  const discountVal = document.getElementById("summary-discount");
  if (discount > 0) {
    discountRow.classList.remove("hidden");
    discountVal.textContent = `-$${discount.toFixed(2)}`;
  } else {
    discountRow.classList.add("hidden");
  }

  // Free shipping banner
  const freeBar = document.getElementById("page-free-shipping-bar");
  const freeTxt = document.getElementById("page-free-shipping-text");
  const freePct = document.getElementById("page-free-shipping-pct");

  if (subtotal >= 100) {
    freeBar.style.width = "100%";
    freePct.textContent = "100%";
    freeTxt.textContent = "🎉 You unlocked FREE Express Shipping!";
  } else {
    const pct = Math.round((subtotal / 100) * 100);
    freeBar.style.width = `${pct}%`;
    freePct.textContent = `${pct}%`;
    freeTxt.textContent = `Add $${(100 - subtotal).toFixed(2)} more for FREE Express Shipping!`;
  }
}

function handleCartPageQty(id, delta) {
  const result = window.lumenStore.updateCartQuantity(id, delta);
  if (result && result.reason === "exceeds_stock") {
    showToast(`Stock limit reached (${result.maxStock} available)`, "info");
  }
  renderCartPage();
  updateHeaderCounts();
}

function handleCartPageRemove(id) {
  window.lumenStore.removeFromCart(id);
  renderCartPage();
  updateHeaderCounts();
  showToast("Item removed from cart", "info");
}

function setupCartPageListeners() {
  document.getElementById("clear-cart-btn")?.addEventListener("click", () => {
    if (window.lumenStore.getCart().length === 0) return;
    window.lumenStore.clearCart();
    renderCartPage();
    updateHeaderCounts();
    showToast("Shopping cart cleared", "info");
  });

  // Apply Promo
  document.getElementById("apply-promo-btn")?.addEventListener("click", () => {
    const code = document.getElementById("promo-input").value.trim().toUpperCase();
    const msg = document.getElementById("promo-msg");

    if (code === "LUMEN20") {
      appliedPromo = "LUMEN20";
      msg.textContent = "✓ Promo LUMEN20 applied! 20% discount added.";
      msg.className = "text-[11px] font-bold text-emerald-600 block";
      renderCartPage();
      showToast("20% discount applied to your order!", "success");
    } else if (code) {
      msg.textContent = "✕ Invalid promo code. Try 'LUMEN20'";
      msg.className = "text-[11px] font-bold text-red-500 block";
    }
  });

  // Checkout Button
  document.getElementById("page-checkout-btn")?.addEventListener("click", () => {
    const cart = window.lumenStore.getCart();
    if (cart.length === 0) {
      showToast("Your cart is empty!", "info");
      return;
    }
    const order = window.lumenStore.createOrder({ customerName: "Valued Customer", paymentMethod: "Credit Card" });
    renderCartPage();
    updateHeaderCounts();
    showToast(`Order ${order.orderNumber} placed successfully! Thank you for shopping with Lumen.`, "success");
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

function updateHeaderCounts() {
  const cart = window.lumenStore.getCart();
  const totalCount = cart.length;

  ["cart-badge-count-desktop", "cart-badge-count-mobile"].forEach((id) => {
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
    const order = window.lumenStore.createOrder({ customerName: "Valued Customer", paymentMethod: "Credit Card" });
    updateHeaderCounts();
    renderCartPage();
    showToast(`Order ${order.orderNumber} placed successfully!`, "success");
  });
}

function updateHoverModalContent(cart) {
  const itemsContainer = document.getElementById("hover-cart-items");
  const countEl = document.getElementById("hover-cart-count");
  const subtotalEl = document.getElementById("hover-cart-subtotal");
  if (!itemsContainer || !countEl || !subtotalEl) return;

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  countEl.textContent = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="py-6 text-center text-xs text-outline font-semibold">
        Your cart is empty
      </div>
    `;
    return;
  }

  itemsContainer.innerHTML = cart.slice(0, 4).map((item) => `
    <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface dark:bg-slate-800/60 border border-outline-variant/20">
      <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-10 h-10 object-cover rounded-lg shrink-0"/>
      <div class="min-w-0 flex-grow">
        <h5 class="text-[11px] font-bold text-on-surface truncate">${item.name}</h5>
        <div class="text-[10px] text-outline font-semibold">${item.quantity} x <span class="text-secondary font-bold">$${item.price.toFixed(2)}</span></div>
      </div>
      <button onclick="handleCartPageRemove('${item.id}')" class="text-outline hover:text-red-500 p-1">
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  `).join("");
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
