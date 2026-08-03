// Cart Page & Checkout Controller connected to store.js

let appliedPromo = null;
let currentTab = "cart";

document.addEventListener("DOMContentLoaded", () => {
  setupCartPageListeners();
  setupLiveSearch();
  setupHoverCartModal();
  updateHeaderCounts();

  const urlParams = new URLSearchParams(window.location.search);
  const step = urlParams.get("step");
  const orderNum = urlParams.get("order");

  if (orderNum) {
    displayReceipt(orderNum);
  } else if (step === "checkout") {
    switchTab("checkout");
  } else {
    renderCartPage();
  }
});

function switchTab(tab) {
  currentTab = tab;

  const viewCart = document.getElementById("view-cart");
  const viewCheckout = document.getElementById("view-checkout");
  const viewReceipt = document.getElementById("view-receipt");

  const btnCart = document.getElementById("step-btn-cart");
  const btnCheckout = document.getElementById("step-btn-checkout");
  const heading = document.getElementById("page-main-heading");
  const breadcrumb = document.getElementById("breadcrumb-active");

  if (tab === "cart") {
    viewCart?.classList.remove("hidden");
    viewCheckout?.classList.add("hidden");
    viewReceipt?.classList.add("hidden");

    if (btnCart) btnCart.className = "flex items-center gap-1.5 text-secondary border-b-2 border-secondary pb-1";
    if (btnCheckout) btnCheckout.className = "flex items-center gap-1.5 text-outline hover:text-on-surface pb-1";

    if (heading) heading.innerHTML = `<span class="material-symbols-outlined text-secondary text-3xl">shopping_cart</span> Your Shopping Cart`;
    if (breadcrumb) breadcrumb.textContent = "Shopping Cart";

    renderCartPage();
  } else if (tab === "checkout") {
    const cart = window.lumenStore.getCart();
    if (cart.length === 0) {
      showToast("Your cart is empty!", "info");
      switchTab("cart");
      return;
    }

    viewCart?.classList.add("hidden");
    viewCheckout?.classList.remove("hidden");
    viewReceipt?.classList.add("hidden");

    if (btnCart) btnCart.className = "flex items-center gap-1.5 text-outline hover:text-on-surface pb-1";
    if (btnCheckout) btnCheckout.className = "flex items-center gap-1.5 text-secondary border-b-2 border-secondary pb-1";

    if (heading) heading.innerHTML = `<span class="material-symbols-outlined text-secondary text-3xl">verified_user</span> Customer Checkout`;
    if (breadcrumb) breadcrumb.textContent = "Checkout";

    renderCheckoutReview();
  } else if (tab === "receipt") {
    viewCart?.classList.add("hidden");
    viewCheckout?.classList.add("hidden");
    viewReceipt?.classList.remove("hidden");

    if (heading) heading.innerHTML = `<span class="material-symbols-outlined text-emerald-500 text-3xl">task_alt</span> Order Confirmation`;
    if (breadcrumb) breadcrumb.textContent = "Order Confirmation";
  }
}

function renderCartPage() {
  const cart = window.lumenStore.getCart();
  const container = document.getElementById("cart-page-items");
  const emptyState = document.getElementById("cart-empty-state");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "";
    emptyState?.classList.remove("hidden");
  } else {
    emptyState?.classList.add("hidden");
    container.innerHTML = cart.map((item) => `
      <div class="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:border-outline-variant/60">
        <div class="flex items-center gap-4 w-full sm:w-1/2 min-w-0">
          <a href="product-detail.html?id=${item.id}" class="w-20 h-20 bg-surface dark:bg-slate-700 rounded-xl p-2 shrink-0 overflow-hidden flex items-center justify-center border border-outline-variant/20 block">
            <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg"/>
          </a>
          <div class="min-w-0 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-secondary">${item.category}</span>
            <a href="product-detail.html?id=${item.id}" class="text-sm font-bold text-on-surface hover:text-secondary transition truncate block">
              ${item.name}
            </a>
            <div class="text-xs font-semibold text-outline">Unit Price: <span class="text-on-surface font-bold">$${item.price.toFixed(2)}</span></div>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-1/2">
          <!-- Quantity Controls -->
          <div class="flex items-center gap-2 bg-surface-container-low dark:bg-slate-700/60 p-1.5 rounded-xl border border-outline-variant/30">
            <button onclick="handleCartQty('${item.id}', -1)" class="w-7 h-7 rounded-lg bg-surface-container-lowest dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-on-surface hover:bg-secondary hover:text-white transition shadow-xs">
              -
            </button>
            <span class="text-xs font-extrabold text-on-surface px-2 min-w-[20px] text-center">${item.quantity}</span>
            <button onclick="handleCartQty('${item.id}', 1)" class="w-7 h-7 rounded-lg bg-surface-container-lowest dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-on-surface hover:bg-secondary hover:text-white transition shadow-xs">
              +
            </button>
          </div>

          <!-- Total Price for item -->
          <div class="text-right">
            <span class="text-base font-extrabold text-secondary dark:text-secondary-fixed">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>

          <!-- Delete Item -->
          <button onclick="handleRemoveCart('${item.id}')" class="text-outline hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition" title="Remove item">
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    `).join("");
  }

  updateSummaryTotals();
}

function updateSummaryTotals() {
  const cart = window.lumenStore.getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedPromo === "LUMEN20") {
    discount = subtotal * 0.20;
  }

  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 12.00;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + shipping + tax;

  document.getElementById("summary-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-shipping").textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
  document.getElementById("summary-tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;

  const discountRow = document.getElementById("summary-discount-row");
  const discountEl = document.getElementById("summary-discount");
  if (discount > 0) {
    discountRow?.classList.remove("hidden");
    if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
  } else {
    discountRow?.classList.add("hidden");
  }

  // Free shipping progress bar
  const freeBar = document.getElementById("free-shipping-bar");
  const freeTxt = document.getElementById("free-shipping-text");
  const freePct = document.getElementById("free-shipping-percent");
  if (freeBar && freeTxt && freePct) {
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
}

function renderCheckoutReview() {
  const cart = window.lumenStore.getCart();
  const reviewContainer = document.getElementById("checkout-review-items");
  if (!reviewContainer) return;

  reviewContainer.innerHTML = cart.map((item) => `
    <div class="flex items-center gap-3 py-2">
      <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-xl border border-outline-variant/30 shrink-0"/>
      <div class="flex-grow min-w-0">
        <h4 class="text-xs font-bold text-on-surface truncate">${item.name}</h4>
        <div class="text-[11px] text-outline">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
      </div>
      <span class="text-xs font-extrabold text-secondary dark:text-secondary-fixed">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  if (appliedPromo === "LUMEN20") discount = subtotal * 0.20;
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 12.00;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + shipping + tax;

  document.getElementById("checkout-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("checkout-shipping").textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
  document.getElementById("checkout-tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("checkout-total").textContent = `$${total.toFixed(2)}`;

  const discountRow = document.getElementById("checkout-discount-row");
  if (discount > 0) {
    discountRow?.classList.remove("hidden");
    document.getElementById("checkout-discount").textContent = `-$${discount.toFixed(2)}`;
  } else {
    discountRow?.classList.add("hidden");
  }
}

function setupCartPageListeners() {
  // Apply Promo
  document.getElementById("apply-promo-btn")?.addEventListener("click", () => {
    const input = document.getElementById("promo-input");
    const msg = document.getElementById("promo-msg");
    const code = input.value.trim().toUpperCase();

    if (code === "LUMEN20") {
      appliedPromo = "LUMEN20";
      msg.textContent = "✓ Promo applied: 20% discount!";
      msg.className = "text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block";
      showToast("Applied 20% promo discount!", "success");
    } else {
      appliedPromo = null;
      msg.textContent = "✕ Invalid promo code. Try 'LUMEN20'";
      msg.className = "text-[11px] font-bold text-red-500 block";
    }

    updateSummaryTotals();
  });

  // Submit Checkout Form
  document.getElementById("checkout-customer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const cart = window.lumenStore.getCart();
    if (cart.length === 0) {
      showToast("Your cart is empty!", "info");
      switchTab("cart");
      return;
    }

    const customerName = document.getElementById("cust-name").value.trim();
    const customerEmail = document.getElementById("cust-email").value.trim();
    const customerPhone = document.getElementById("cust-phone").value.trim();
    const street = document.getElementById("cust-street").value.trim();
    const city = document.getElementById("cust-city").value.trim();
    const state = document.getElementById("cust-state").value.trim();
    const deliveryAddress = `${street}, ${city}, ${state}`;

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "Cash on Delivery";
    const orderNotes = document.getElementById("cust-notes").value.trim();

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;
    if (appliedPromo === "LUMEN20") discount = subtotal * 0.20;
    const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 12.00;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.08;
    const total = taxableAmount + shipping + tax;

    const newOrder = window.lumenStore.createOrder({
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      paymentMethod,
      orderNotes,
      subtotal,
      shipping,
      discount,
      tax,
      totalAmount: total
    });

    history.pushState(null, "", `cart.html?order=${newOrder.orderNumber}`);
    displayReceipt(newOrder.orderNumber, newOrder);
    updateHeaderCounts();
    showToast(`Order #${newOrder.orderNumber} placed successfully!`, "success");
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

function displayReceipt(orderNumber, existingOrder = null) {
  switchTab("receipt");

  const orders = window.lumenStore.getOrders();
  const order = existingOrder || orders.find((o) => o.orderNumber === orderNumber || o.orderNumber === orderNumber.replace("#", ""));

  if (!order) return;

  document.getElementById("receipt-order-number").textContent = `#${order.orderNumber}`;
  document.getElementById("receipt-order-status").textContent = order.orderStatus || "Pending";
  document.getElementById("receipt-cust-name").textContent = order.customerName || "Customer";
  document.getElementById("receipt-cust-email").textContent = order.customerEmail || "N/A";
  document.getElementById("receipt-cust-phone").textContent = order.customerPhone || "N/A";
  document.getElementById("receipt-cust-payment").textContent = order.paymentMethod || "Cash on Delivery";
  document.getElementById("receipt-cust-address").textContent = order.deliveryAddress || "N/A";

  const itemsList = document.getElementById("receipt-items-list");
  if (itemsList && order.items) {
    itemsList.innerHTML = order.items.map((item) => `
      <div class="flex items-center justify-between py-2 text-xs">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-10 h-10 object-cover rounded-lg border border-outline-variant/30 shrink-0"/>
          <div class="min-w-0">
            <span class="font-bold text-on-surface truncate block">${item.name}</span>
            <span class="text-[11px] text-outline">Qty: ${item.quantity} × $${item.price.toFixed(2)}</span>
          </div>
        </div>
        <span class="font-extrabold text-secondary dark:text-secondary-fixed shrink-0">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join("");
  }

  const total = order.totalAmount || order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  document.getElementById("receipt-total-paid").textContent = `$${total.toFixed(2)}`;
}

function handleCartQty(id, delta) {
  window.lumenStore.updateCartQuantity(id, delta);
  if (currentTab === "cart") renderCartPage();
  else if (currentTab === "checkout") renderCheckoutReview();
  updateHeaderCounts();
}

function handleRemoveCart(id) {
  window.lumenStore.removeFromCart(id);
  if (currentTab === "cart") renderCartPage();
  else if (currentTab === "checkout") renderCheckoutReview();
  updateHeaderCounts();
}

// Live Search & Cart Header Sync
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
      (p.brand && p.brand.toLowerCase().includes(q))
    ).slice(0, 5);

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="p-4 text-center text-xs text-outline font-semibold">No matching products found</div>`;
    } else {
      dropdown.innerHTML = matches.map((p) => `
        <a href="product-detail.html?id=${p.id}" class="flex items-center justify-between p-3 hover:bg-surface-container-low dark:hover:bg-slate-700/60 transition group cursor-pointer border-b border-outline-variant/20 last:border-0">
          <div class="flex items-center gap-3 min-w-0">
            <img src="${p.images ? p.images[0] : p.image}" alt="${p.name}" class="w-10 h-10 object-cover rounded-lg shrink-0"/>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-on-surface truncate group-hover:text-secondary transition">${p.name}</h4>
              <span class="text-[10px] text-outline uppercase font-semibold">${p.category}</span>
            </div>
          </div>
          <span class="text-xs font-black text-on-surface shrink-0 ml-3">$${p.price.toFixed(2)}</span>
        </a>
      `).join("");
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
    itemsContainer.innerHTML = `<div class="py-6 text-center text-xs text-outline font-semibold">Your cart is empty</div>`;
    return;
  }

  itemsContainer.innerHTML = cart.slice(0, 4).map((item) => `
    <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface dark:bg-slate-800 border border-outline-variant/20">
      <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-9 h-9 object-cover rounded-lg shrink-0"/>
      <div class="min-w-0 flex-grow">
        <h5 class="text-[11px] font-bold text-on-surface truncate">${item.name}</h5>
        <div class="flex items-center gap-1.5 mt-0.5">
          <button onclick="handleCartQty('${item.id}', -1)" class="w-4 h-4 rounded bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface">-</button>
          <span class="text-[10px] font-bold">${item.quantity}</span>
          <button onclick="handleCartQty('${item.id}', 1)" class="w-4 h-4 rounded bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface">+</button>
          <span class="text-[10px] text-secondary font-bold ml-1">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
      <button onclick="handleRemoveCart('${item.id}')" class="text-outline hover:text-red-500 p-1">
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  `).join("");
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
  } else if (type === "success") {
    icon = "verified";
    bgClass = "bg-emerald-600 text-white";
  }

  toast.className = `toast-animate-in ${bgClass} px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold max-w-sm pointer-events-auto border border-outline-variant/30`;
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
