// Checkout Page Controller (checkout.js)

let appliedCoupon = null;
let discountPercent = 0;

document.addEventListener("DOMContentLoaded", () => {
  if (window.initTheme) window.initTheme();
  initCheckoutPage();
});

function initCheckoutPage() {
  renderCheckoutSummary();
  setupPaymentMethodListeners();
  setupCouponListener();
  setupFormSubmitListener();
  initUrgencyTimer();
}

function initUrgencyTimer() {
  const timerEl = document.getElementById("cart-timer");
  if (!timerEl) return;

  let totalSeconds = 39 * 60 + 43;
  setInterval(() => {
    if (totalSeconds <= 0) return;
    totalSeconds--;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, 1000);
}

function renderCheckoutSummary() {
  const container = document.getElementById("checkout-items-list");
  const countBadge = document.getElementById("checkout-items-count");
  if (!container) return;

  const cart = window.lumenStore.getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (countBadge) {
    countBadge.textContent = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center space-y-3 bg-surface dark:bg-slate-700/40 rounded-2xl border border-outline-variant/30">
        <span class="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
        <h4 class="text-xs font-bold text-on-surface">Your cart is empty</h4>
        <a href="products.html" class="inline-block bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-secondary-container transition">
          Browse Products
        </a>
      </div>
    `;
    updateCheckoutTotals(0);
    return;
  }

  container.innerHTML = cart.map((item) => `
    <div class="p-4 bg-surface dark:bg-slate-800 rounded-none border border-outline-variant/30 flex items-start gap-4 transition hover:border-secondary/40 shadow-xs">
      <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-none shrink-0 border border-outline-variant/20 bg-white dark:bg-slate-700 p-1"/>
      <div class="flex-grow min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h4 class="text-sm md:text-base font-extrabold text-on-surface line-clamp-2 leading-snug">${item.name}</h4>
          <span class="text-base font-black text-on-surface shrink-0">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        <div class="flex flex-wrap items-center gap-3 mt-1 text-xs text-outline font-medium">
          <span class="flex items-center gap-1">• ${item.brand || item.category || 'Standard'}</span>
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">local_shipping</span> 2 days delivery time</span>
        </div>
        <div class="flex items-center justify-between mt-3 pt-2 border-t border-outline-variant/10">
          <div class="flex items-center gap-3 text-xs font-semibold text-outline">
            <button onclick="handleCheckoutRemove('${item.id}')" class="hover:text-red-500 transition">Remove</button>
            <span>•</span>
            <button onclick="showToast('Saved for later', 'wishlist')" class="hover:text-secondary transition">Save for later</button>
          </div>
          <div class="flex items-center bg-surface-container dark:bg-slate-700/80 rounded-xl px-2 py-1 border border-outline-variant/40">
            <button onclick="handleCheckoutQty('${item.id}', -1)" class="w-6 h-6 rounded-lg text-xs font-bold text-on-surface hover:bg-white dark:hover:bg-slate-600 transition flex items-center justify-center">-</button>
            <span class="text-xs font-black px-2.5">${item.quantity}</span>
            <button onclick="handleCheckoutQty('${item.id}', 1)" class="w-6 h-6 rounded-lg text-xs font-bold text-on-surface hover:bg-white dark:hover:bg-slate-600 transition flex items-center justify-center">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  updateCheckoutTotals(subtotal);
}

function handleCheckoutQty(id, delta) {
  window.lumenStore.updateCartQuantity(id, delta);
  renderCheckoutSummary();
  if (window.updateHeaderCounts) window.updateHeaderCounts();
}

function handleCheckoutRemove(id) {
  window.lumenStore.removeFromCart(id);
  renderCheckoutSummary();
  if (window.updateHeaderCounts) window.updateHeaderCounts();
}

function updateCheckoutTotals(subtotal) {
  const discountAmount = subtotal * (discountPercent / 100);
  const discountedSubtotal = subtotal - discountAmount;
  
  const shippingFee = (subtotal === 0 || subtotal >= 50) ? 0 : 9.99;
  const taxAmount = discountedSubtotal * 0.08;
  const grandTotal = discountedSubtotal + shippingFee + taxAmount;

  document.getElementById("checkout-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  
  const discountRow = document.getElementById("discount-row");
  const discountEl = document.getElementById("checkout-discount");
  if (discountPercent > 0) {
    discountRow.classList.remove("hidden");
    discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
  } else {
    discountRow.classList.add("hidden");
  }

  const shippingEl = document.getElementById("checkout-shipping");
  if (shippingFee === 0) {
    shippingEl.textContent = "FREE";
    shippingEl.className = "font-bold text-emerald-600 dark:text-emerald-400";
  } else {
    shippingEl.textContent = `$${shippingFee.toFixed(2)}`;
    shippingEl.className = "font-bold text-on-surface";
  }

  document.getElementById("checkout-tax").textContent = `$${taxAmount.toFixed(2)}`;
  document.getElementById("checkout-total").textContent = `$${grandTotal.toFixed(2)}`;
  document.getElementById("btn-total-display").textContent = `$${grandTotal.toFixed(2)}`;
}

function setupPaymentMethodListeners() {
  const radios = document.querySelectorAll('input[name="paymentMethod"]');
  const detailsPanel = document.getElementById("payment-details-panel");
  if (!radios || !detailsPanel) return;

  radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      // Highlight container card
      document.querySelectorAll(".payment-option-card").forEach((card) => {
        card.classList.remove("border-secondary", "bg-secondary/5", "dark:bg-slate-700/60");
        card.classList.add("border-outline-variant/30", "bg-surface", "dark:bg-slate-800");
      });

      const label = e.target.closest("label");
      if (label) {
        label.classList.add("border-secondary", "bg-secondary/5", "dark:bg-slate-700/60");
        label.classList.remove("border-outline-variant/30");
      }

      const method = e.target.value;
      if (method === "Cash on Delivery") {
        detailsPanel.innerHTML = `
          <div class="flex items-start gap-2.5">
            <span class="material-symbols-outlined text-amber-500 text-lg shrink-0">info</span>
            <div>
              <p class="font-bold text-on-surface">Cash on Delivery (COD) Selected</p>
              <p class="mt-0.5 text-outline">Please prepare the exact cash amount for our delivery courier upon receipt of your package.</p>
            </div>
          </div>
        `;
      } else if (method === "E-Wallet") {
        detailsPanel.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center gap-2 font-bold text-on-surface">
              <span class="material-symbols-outlined text-blue-600 text-lg">account_balance_wallet</span>
              <span>E-Wallet Transfer (GCash / Maya / PayPal)</span>
            </div>
            <p class="text-outline">Send total amount to our verified merchant account:</p>
            <div class="bg-surface-container dark:bg-slate-800 p-2.5 rounded-xl space-y-1 font-mono text-[11px]">
              <div><strong class="text-on-surface">GCash / Maya:</strong> 0917-888-LUMEN (09178885863)</div>
              <div><strong class="text-on-surface">Account Name:</strong> Lumen Digital Commerce Inc.</div>
            </div>
            <p class="text-[11px] text-outline">Please keep your reference number for verification.</p>
          </div>
        `;
      } else if (method === "Bank Transfer") {
        detailsPanel.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center gap-2 font-bold text-on-surface">
              <span class="material-symbols-outlined text-emerald-600 text-lg">account_balance</span>
              <span>Direct Bank Deposit</span>
            </div>
            <p class="text-outline">Deposit your total amount to our corporate account:</p>
            <div class="bg-surface-container dark:bg-slate-800 p-2.5 rounded-xl space-y-1 font-mono text-[11px]">
              <div><strong class="text-on-surface">Bank Name:</strong> BDO / BPI Unibank</div>
              <div><strong class="text-on-surface">Account No:</strong> 0012-3456-7890</div>
              <div><strong class="text-on-surface">Account Name:</strong> Lumen Commercial Store</div>
            </div>
          </div>
        `;
      }
    });
  });
}

function setupCouponListener() {
  const btn = document.getElementById("apply-coupon-btn");
  const input = document.getElementById("coupon-input");
  const msg = document.getElementById("coupon-message");
  if (!btn || !input || !msg) return;

  btn.addEventListener("click", () => {
    const code = input.value.trim().toUpperCase();
    if (!code) return;

    if (code === "LUMEN10") {
      discountPercent = 10;
      appliedCoupon = "LUMEN10";
      msg.textContent = "✓ 10% Discount Applied Successfully!";
      msg.className = "text-[11px] font-bold mt-1 text-emerald-600 dark:text-emerald-400";
      msg.classList.remove("hidden");
      renderCheckoutSummary();
    } else if (code === "FREESHIP") {
      discountPercent = 5;
      appliedCoupon = "FREESHIP";
      msg.textContent = "✓ Promo code applied!";
      msg.className = "text-[11px] font-bold mt-1 text-emerald-600 dark:text-emerald-400";
      msg.classList.remove("hidden");
      renderCheckoutSummary();
    } else {
      msg.textContent = "Invalid promo code. Try 'LUMEN10'";
      msg.className = "text-[11px] font-bold mt-1 text-red-500";
      msg.classList.remove("hidden");
    }
  });
}

function setDeliveryType(type) {
  const homeBtn = document.getElementById("toggle-home-delivery");
  const pickupBtn = document.getElementById("toggle-pickup");
  if (!homeBtn || !pickupBtn) return;

  if (type === "home") {
    homeBtn.className = "delivery-toggle-btn py-2 text-center rounded-lg text-xs font-bold bg-black dark:bg-white text-white dark:text-slate-900 shadow-sm transition";
    pickupBtn.className = "delivery-toggle-btn py-2 text-center rounded-lg text-xs font-semibold text-outline hover:text-on-surface transition";
    if (window.showToast) window.showToast("Selected Home Delivery", "info");
  } else {
    pickupBtn.className = "delivery-toggle-btn py-2 text-center rounded-lg text-xs font-bold bg-black dark:bg-white text-white dark:text-slate-900 shadow-sm transition";
    homeBtn.className = "delivery-toggle-btn py-2 text-center rounded-lg text-xs font-semibold text-outline hover:text-on-surface transition";
    if (window.showToast) window.showToast("Selected DEZZ Pickup Location", "info");
  }
}

function setupFormSubmitListener() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const cart = window.lumenStore.getCart();
    if (cart.length === 0) {
      if (window.showToast) window.showToast("Your cart is empty! Add products first.", "info");
      return;
    }

    const firstName = document.getElementById("cust-firstname")?.value.trim() || "";
    const lastName = document.getElementById("cust-lastname")?.value.trim() || "";
    const name = `${firstName} ${lastName}`.trim() || document.getElementById("cust-name")?.value.trim() || "Guest Customer";

    const email = document.getElementById("cust-email").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const address = document.getElementById("cust-address").value.trim();
    const apt = document.getElementById("cust-apt")?.value.trim() || "";
    const city = document.getElementById("cust-city").value.trim();
    const state = document.getElementById("cust-state").value.trim();
    const notes = document.getElementById("cust-notes").value.trim();
    
    const fullAddress = `${address}${apt ? ', ' + apt : ''}, ${city}, ${state}`;

    const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : "Cash on Delivery";

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const shippingFee = (subtotal === 0 || subtotal >= 50) ? 0 : 9.99;
    const taxAmount = discountedSubtotal * 0.08;
    const grandTotal = discountedSubtotal + shippingFee + taxAmount;

    const orderPayload = {
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      deliveryAddress: fullAddress,
      paymentMethod: paymentMethod,
      orderNotes: notes,
      couponUsed: appliedCoupon,
      subtotal: subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shipping: shippingFee,
      totalAmount: grandTotal
    };

    // Create Order in Store
    const newOrder = window.lumenStore.createOrder(orderPayload);

    // Update Header Counts
    if (window.updateHeaderCounts) window.updateHeaderCounts();

    // Render Receipt Confirmation View
    renderConfirmationReceipt(newOrder, orderPayload);
  });
}

function renderConfirmationReceipt(order, payload) {
  const mainView = document.getElementById("checkout-main-view");
  const confirmView = document.getElementById("confirmation-view");
  if (!mainView || !confirmView) return;

  mainView.classList.add("hidden");
  confirmView.classList.remove("hidden");

  document.getElementById("receipt-order-id").textContent = `#${order.orderNumber}`;
  document.getElementById("receipt-name").textContent = payload.customerName;
  document.getElementById("receipt-email").textContent = payload.customerEmail;
  document.getElementById("receipt-phone").textContent = payload.customerPhone;
  document.getElementById("receipt-address").textContent = payload.deliveryAddress;
  document.getElementById("receipt-payment").textContent = `Payment: ${payload.paymentMethod}`;

  const receiptItemsContainer = document.getElementById("receipt-items-list");
  if (receiptItemsContainer) {
    receiptItemsContainer.innerHTML = order.items.map((item) => `
      <div class="flex items-center justify-between py-1 border-b border-outline-variant/10 last:border-0">
        <div class="flex items-center gap-2">
          <img src="${item.images ? item.images[0] : item.image}" alt="${item.name}" class="w-8 h-8 object-cover rounded-lg"/>
          <div>
            <span class="font-bold text-on-surface block">${item.name}</span>
            <span class="text-[10px] text-outline">Qty: ${item.quantity} x $${item.price.toFixed(2)}</span>
          </div>
        </div>
        <span class="font-extrabold text-on-surface">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join("");
  }

  document.getElementById("receipt-total-paid").textContent = `$${payload.totalAmount.toFixed(2)}`;

  window.scrollTo({ top: 0, behavior: "smooth" });
}
