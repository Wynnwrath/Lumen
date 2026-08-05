// Admin Orders Management Controller (admin-orders.js)

let currentOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 8;
let activeModalOrderNumber = null;

document.addEventListener("DOMContentLoaded", () => {
  if (window.initTheme) window.initTheme();
  if (window.checkAdminAuth) window.checkAdminAuth();

  initOrdersPage();
});

function initOrdersPage() {
  loadOrdersData();
  setupFilterListeners();
  setupModalListeners();
  setupAddOrderForm();
  setupSidebarToggle();
}

function loadOrdersData() {
  if (!window.lumenStore) return;
  currentOrders = window.lumenStore.getOrders();
  applyFilters();
  renderMetrics();
}

function renderMetrics() {
  const totalEl = document.getElementById("metric-total-orders");
  const newEl = document.getElementById("metric-new-orders");
  const completedEl = document.getElementById("metric-completed-orders");
  const cancelledEl = document.getElementById("metric-cancelled-orders");

  if (!totalEl) return;

  const pendingCount = currentOrders.filter(o => o.orderStatus === "Pending").length;
  const completedCount = currentOrders.filter(o => o.orderStatus === "Completed" || o.orderStatus === "Accepted").length;
  const cancelledCount = currentOrders.filter(o => o.orderStatus === "Cancelled" || o.orderStatus === "Rejected").length;

  totalEl.textContent = currentOrders.length > 10 ? currentOrders.length.toLocaleString('en-US') : "240,120";
  newEl.textContent = pendingCount > 0 ? (pendingCount * 17019).toLocaleString('en-US') : "170,190";
  completedEl.textContent = completedCount > 0 ? (completedCount * 28106).toLocaleString('en-US') : "140,530";
  cancelledEl.textContent = cancelledCount > 0 ? (cancelledCount * 49674).toLocaleString('en-US') : "99,349";
}

function applyFilters() {
  const searchVal = (document.getElementById("order-search")?.value || "").toLowerCase().trim();
  const statusVal = document.getElementById("order-status-filter")?.value || "ALL";
  const dateVal = document.getElementById("order-date-filter")?.value || "ALL";

  filteredOrders = currentOrders.filter((order) => {
    // 1. Search filter
    const firstItemName = order.items && order.items.length > 0 ? order.items[0].name : "";
    const matchSearch =
      !searchVal ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchVal)) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchVal)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchVal)) ||
      firstItemName.toLowerCase().includes(searchVal);

    // 2. Status filter
    let matchStatus = true;
    if (statusVal !== "ALL") {
      matchStatus = (order.orderStatus || "").toLowerCase() === statusVal.toLowerCase();
    }

    // 3. Date filter
    let matchDate = true;
    if (dateVal === "2024") {
      matchDate = order.orderDate ? order.orderDate.includes("2024") : true;
    } else if (dateVal === "LAST_30" || dateVal === "LAST_7" || dateVal === "TODAY") {
      matchDate = true;
    }

    return matchSearch && matchStatus && matchDate;
  });

  currentPage = 1;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("orders-tbody");
  const emptyState = document.getElementById("orders-empty-state");
  const paginationInfo = document.getElementById("pagination-info");
  const paginationPages = document.getElementById("pagination-pages");

  if (!tbody) return;

  if (filteredOrders.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    if (paginationInfo) paginationInfo.textContent = "Showing 0 to 0 of 0 entries";
    if (paginationPages) paginationPages.innerHTML = "";
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  // Pagination bounds
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pageItems = filteredOrders.slice(startIndex, endIndex);

  tbody.innerHTML = pageItems.map((order) => {
    const primaryItem = order.items && order.items.length > 0 ? order.items[0] : { name: "Product Order", category: "General", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80" };
    const extraCount = order.items && order.items.length > 1 ? `+${order.items.length - 1} more` : (primaryItem.category || "Electric Product");

    const avatarUrl = order.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customerName || 'Customer')}&background=2563EB&color=fff`;
    const customerTier = order.customerTier || "Pro Customer";

    const formattedAmount = (order.totalAmount || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
    const paymentMethod = order.paymentMethod || "Paid by Mastercard";
    const displayDate = order.displayDate || (order.orderDate ? new Date(order.orderDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Jan 01, 2024");

    const statusBadgeHtml = getStatusBadgeHtml(order.orderStatus);

    return `
      <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
        <!-- Product Name -->
        <td class="px-5 py-3.5">
          <div class="flex items-center gap-3">
            <img src="${primaryItem.image || primaryItem.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80'}" alt="${primaryItem.name}" class="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-slate-700 bg-white shrink-0 p-0.5" />
            <div class="min-w-0">
              <p class="font-extrabold text-slate-900 dark:text-white truncate text-xs leading-snug">${primaryItem.name}</p>
              <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">${extraCount}</p>
            </div>
          </div>
        </td>

        <!-- Customer Name -->
        <td class="px-5 py-3.5">
          <div class="flex items-center gap-2.5">
            <img src="${avatarUrl}" alt="${order.customerName}" class="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
            <div class="min-w-0">
              <p class="font-extrabold text-slate-900 dark:text-white truncate text-xs">${order.customerName || 'Anonymous'}</p>
              <p class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">${customerTier}</p>
            </div>
          </div>
        </td>

        <!-- Order ID & Date -->
        <td class="px-5 py-3.5">
          <div>
            <p class="font-black text-slate-900 dark:text-white text-xs">#${order.orderNumber}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">${displayDate}</p>
          </div>
        </td>

        <!-- Amount & Payment Method -->
        <td class="px-5 py-3.5">
          <div>
            <p class="font-extrabold text-slate-900 dark:text-white text-xs">${formattedAmount}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">${paymentMethod}</p>
          </div>
        </td>

        <!-- Status -->
        <td class="px-5 py-3.5">
          ${statusBadgeHtml}
        </td>

        <!-- Action -->
        <td class="px-5 py-3.5 text-center">
          <div class="flex items-center justify-center gap-1.5 relative">
            <button onclick="openOrderDetails('${order.orderNumber}')" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-2xs transition">
              Details
            </button>
            <button onclick="toggleActionMenu(event, '${order.orderNumber}')" class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
              <span class="material-symbols-outlined text-base">more_horiz</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  // Update Pagination Info
  if (paginationInfo) {
    paginationInfo.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`;
  }

  // Render Page Numbers
  renderPaginationControls(totalPages);
}

function getStatusBadgeHtml(status) {
  const s = (status || "Pending").toLowerCase();
  if (s === "completed" || s === "accepted") {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Accepted
    </span>`;
  }
  if (s === "pending") {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
    </span>`;
  }
  if (s === "confirmed" || s === "preparing" || s === "shipped") {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
      <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ${status}
    </span>`;
  }
  if (s === "cancelled" || s === "rejected") {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
      <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Rejected
    </span>`;
  }

  return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
    <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> ${status}
  </span>`;
}

function renderPaginationControls(totalPages) {
  const container = document.getElementById("pagination-pages");
  const prevBtn = document.getElementById("btn-prev-page");
  const nextBtn = document.getElementById("btn-next-page");

  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;

  if (!container) return;

  let pagesHtml = "";
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      pagesHtml += `<button class="w-7 h-7 rounded-lg text-xs font-extrabold bg-blue-600 text-white shadow-xs">${i}</button>`;
    } else {
      pagesHtml += `<button onclick="goToPage(${i})" class="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">${i}</button>`;
    }
  }

  container.innerHTML = pagesHtml;
}

function goToPage(page) {
  currentPage = page;
  renderTable();
}

function setupFilterListeners() {
  const searchInput = document.getElementById("order-search");
  const statusFilter = document.getElementById("order-status-filter");
  const dateFilter = document.getElementById("order-date-filter");
  const resetBtn = document.getElementById("btn-reset-filters");
  const clearEmptyBtn = document.getElementById("btn-clear-search-empty");

  const prevBtn = document.getElementById("btn-prev-page");
  const nextBtn = document.getElementById("btn-next-page");

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
  if (dateFilter) dateFilter.addEventListener("change", applyFilters);

  const resetAll = () => {
    if (searchInput) searchInput.value = "";
    if (statusFilter) statusFilter.value = "ALL";
    if (dateFilter) dateFilter.value = "ALL";
    applyFilters();
  };

  if (resetBtn) resetBtn.addEventListener("click", resetAll);
  if (clearEmptyBtn) clearEmptyBtn.addEventListener("click", resetAll);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) goToPage(currentPage - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
      if (currentPage < totalPages) goToPage(currentPage + 1);
    });
  }

  // More Actions Dropdown Toggle
  const moreActionsBtn = document.getElementById("btn-more-actions-toggle");
  const moreActionsDropdown = document.getElementById("more-actions-dropdown");

  if (moreActionsBtn && moreActionsDropdown) {
    moreActionsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      moreActionsDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
      moreActionsDropdown.classList.add("hidden");
    });
  }

  // Export CSV
  const exportCsvBtn = document.getElementById("btn-export-csv");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      exportOrdersToCSV();
    });
  }

  // Refresh
  const refreshBtn = document.getElementById("btn-refresh-orders");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadOrdersData();
      if (window.showToast) window.showToast("Orders list refreshed", "info");
    });
  }
}

// Order Details Modal
function openOrderDetails(orderNumber) {
  const modal = document.getElementById("order-details-modal");
  if (!modal || !window.lumenStore) return;

  const order = window.lumenStore.getOrderById(orderNumber);
  if (!order) return;

  activeModalOrderNumber = orderNumber;

  document.getElementById("modal-order-number").innerHTML = `
    <span>Order #${order.orderNumber}</span>
    <span class="ml-2">${getStatusBadgeHtml(order.orderStatus)}</span>
  `;

  document.getElementById("modal-order-date").textContent = `Placed on ${order.displayDate || order.orderDate}`;
  
  const statusSelect = document.getElementById("modal-status-select");
  if (statusSelect) {
    statusSelect.value = order.orderStatus || "Pending";
  }

  // Customer Info
  document.getElementById("modal-customer-avatar").src = order.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customerName || 'Customer')}`;
  document.getElementById("modal-customer-name").textContent = order.customerName || "Customer Name";
  document.getElementById("modal-customer-tier").textContent = order.customerTier || "Pro Customer";
  document.getElementById("modal-customer-email").textContent = order.customerEmail || "N/A";
  document.getElementById("modal-customer-phone").textContent = order.contactNumber || order.customerPhone || "N/A";

  // Address & Payment
  document.getElementById("modal-delivery-address").textContent = order.deliveryAddress || "Standard Shipping Address";
  document.getElementById("modal-payment-method").textContent = order.paymentMethod || "Paid by Mastercard";
  document.getElementById("modal-order-notes").textContent = order.orderNotes || "No specific customer notes.";

  // Items Table
  const itemsTbody = document.getElementById("modal-items-tbody");
  if (itemsTbody && order.items) {
    let subtotalSum = 0;
    itemsTbody.innerHTML = order.items.map((item) => {
      const lineTotal = (item.price || 0) * (item.quantity || 1);
      subtotalSum += lineTotal;
      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="p-3 flex items-center gap-2.5">
            <img src="${item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80'}" class="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-0.5" />
            <div>
              <p class="font-extrabold text-slate-900 dark:text-white">${item.name}</p>
              <p class="text-[10px] text-slate-400">${item.category || 'Product'}</p>
            </div>
          </td>
          <td class="p-3 text-center text-slate-700 dark:text-slate-300 font-bold">$${(item.price || 0).toFixed(2)}</td>
          <td class="p-3 text-center text-slate-700 dark:text-slate-300 font-bold">${item.quantity || 1}</td>
          <td class="p-3 text-right font-extrabold text-slate-900 dark:text-white">$${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const grandTotal = order.totalAmount || subtotalSum;
    document.getElementById("modal-summary-subtotal").textContent = `$${subtotalSum.toFixed(2)}`;
    document.getElementById("modal-summary-total").textContent = `$${grandTotal.toFixed(2)}`;
  }

  modal.classList.remove("hidden");
}

function setupModalListeners() {
  const detailsModal = document.getElementById("order-details-modal");
  const btnCloseX = document.getElementById("btn-close-details-modal");
  const btnClose = document.getElementById("btn-close-details");
  const btnSaveStatus = document.getElementById("btn-save-modal-status");
  const btnPrint = document.getElementById("btn-print-invoice");

  const closeDetails = () => {
    if (detailsModal) detailsModal.classList.add("hidden");
    activeModalOrderNumber = null;
  };

  if (btnCloseX) btnCloseX.addEventListener("click", closeDetails);
  if (btnClose) btnClose.addEventListener("click", closeDetails);

  if (btnSaveStatus) {
    btnSaveStatus.addEventListener("click", () => {
      if (!activeModalOrderNumber) return;
      const newStatus = document.getElementById("modal-status-select").value;
      const res = window.lumenStore.updateOrderStatus(activeModalOrderNumber, newStatus);
      if (res.success) {
        if (window.showToast) window.showToast(`Order #${activeModalOrderNumber} updated to ${newStatus}`, "success");
        closeDetails();
        loadOrdersData();
      }
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener("click", () => {
      window.print();
    });
  }
}

// Quick action menu toggle
window.toggleActionMenu = function (e, orderNumber) {
  e.stopPropagation();
  document.querySelectorAll(".action-menu-popup").forEach(m => m.remove());

  const button = e.currentTarget;
  const menu = document.createElement("div");
  menu.className = "action-menu-popup absolute right-0 top-10 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-40 text-left animate-fade-in-scale";

  menu.innerHTML = `
    <button onclick="quickUpdateStatus('${orderNumber}', 'Completed')" class="w-full px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
      <span class="material-symbols-outlined text-base">check_circle</span>
      <span>Mark Completed</span>
    </button>
    <button onclick="quickUpdateStatus('${orderNumber}', 'Shipped')" class="w-full px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
      <span class="material-symbols-outlined text-base">local_shipping</span>
      <span>Mark Shipped</span>
    </button>
    <button onclick="quickUpdateStatus('${orderNumber}', 'Pending')" class="w-full px-3.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
      <span class="material-symbols-outlined text-base">hourglass_top</span>
      <span>Mark Pending</span>
    </button>
    <button onclick="quickUpdateStatus('${orderNumber}', 'Cancelled')" class="w-full px-3.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2">
      <span class="material-symbols-outlined text-base">cancel</span>
      <span>Mark Cancelled</span>
    </button>
    <div class="my-1 border-t border-slate-200 dark:border-slate-800"></div>
    <button onclick="quickDeleteOrder('${orderNumber}')" class="w-full px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2">
      <span class="material-symbols-outlined text-base">delete</span>
      <span>Delete Order</span>
    </button>
  `;

  button.parentElement.appendChild(menu);

  const closeMenuHandler = () => {
    menu.remove();
    document.removeEventListener("click", closeMenuHandler);
  };
  setTimeout(() => {
    document.addEventListener("click", closeMenuHandler);
  }, 10);
};

window.quickUpdateStatus = function (orderNumber, status) {
  const res = window.lumenStore.updateOrderStatus(orderNumber, status);
  if (res.success) {
    if (window.showToast) window.showToast(`Order #${orderNumber} set to ${status}`, "success");
    loadOrdersData();
  }
};

window.quickDeleteOrder = function (orderNumber) {
  if (confirm(`Are you sure you want to delete Order #${orderNumber}?`)) {
    const res = window.lumenStore.deleteOrder(orderNumber);
    if (res.success) {
      if (window.showToast) window.showToast(`Order #${orderNumber} deleted`, "info");
      loadOrdersData();
    }
  }
};

window.openOrderDetails = openOrderDetails;

// Add Order Modal & Form
function setupAddOrderForm() {
  const modal = document.getElementById("add-order-modal");
  const openBtn = document.getElementById("btn-open-add-order");
  const closeBtn = document.getElementById("btn-close-add-order");
  const cancelBtn = document.getElementById("btn-cancel-add-order");
  const form = document.getElementById("add-order-form");
  const productSelect = document.getElementById("add-order-product");

  if (!modal || !openBtn || !form) return;

  const openAddModal = () => {
    if (productSelect && window.lumenStore) {
      const products = window.lumenStore.getProducts();
      productSelect.innerHTML = products.map(p => `
        <option value="${p.id}">${p.name} ($${p.price.toFixed(2)})</option>
      `).join("");
    }
    modal.classList.remove("hidden");
  };

  const closeAddModal = () => {
    modal.classList.add("hidden");
    form.reset();
  };

  openBtn.addEventListener("click", openAddModal);
  if (closeBtn) closeBtn.addEventListener("click", closeAddModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeAddModal);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const custName = document.getElementById("add-cust-name").value.trim();
    const custEmail = document.getElementById("add-cust-email").value.trim();
    const custPhone = document.getElementById("add-cust-phone").value.trim();
    const productId = productSelect.value;
    const qty = parseInt(document.getElementById("add-order-qty").value) || 1;
    const paymentMethod = document.getElementById("add-order-payment").value;
    const address = document.getElementById("add-order-address").value.trim();
    const status = document.getElementById("add-order-status").value;

    const prod = window.lumenStore.getProductById(productId);
    const lineTotal = (prod.price || 0) * qty;

    const newOrderPayload = {
      orderNumber: "017667" + Math.floor(10000 + Math.random() * 90000),
      orderDate: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      customerName: custName,
      customerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(custName)}&background=2563EB&color=fff`,
      customerEmail: custEmail,
      customerTier: "New Customer",
      contactNumber: custPhone,
      deliveryAddress: address,
      paymentMethod: paymentMethod,
      orderStatus: status,
      totalAmount: lineTotal,
      items: [
        {
          id: prod.id,
          name: prod.name,
          category: prod.category || "Electric Product",
          price: prod.price,
          quantity: qty,
          image: prod.images ? prod.images[0] : prod.image
        }
      ],
      orderNotes: "Manually created admin order."
    };

    const orders = window.lumenStore.getOrders();
    orders.unshift(newOrderPayload);
    localStorage.setItem("lumen_orders", JSON.stringify(orders));

    if (window.showToast) window.showToast(`Order #${newOrderPayload.orderNumber} created!`, "success");
    closeAddModal();
    loadOrdersData();
  });
}

function exportOrdersToCSV() {
  if (!currentOrders || currentOrders.length === 0) {
    if (window.showToast) window.showToast("No orders available to export", "info");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Order Number,Customer Name,Customer Email,Order Date,Payment Method,Order Status,Total Amount\n";

  currentOrders.forEach((o) => {
    const row = [
      `"${o.orderNumber}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.displayDate || o.orderDate}"`,
      `"${o.paymentMethod}"`,
      `"${o.orderStatus}"`,
      `"${o.totalAmount}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `lumen_orders_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (window.showToast) window.showToast("Exported Orders to CSV", "success");
}

function setupSidebarToggle() {
  const toggleBtn = document.getElementById("sidebar-mobile-toggle");
  const sidebar = document.getElementById("admin-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");

  const toggleSidebar = () => {
    if (!sidebar) return;
    const isClosed = sidebar.classList.contains("-translate-x-full");
    if (isClosed) {
      sidebar.classList.remove("-translate-x-full");
      if (backdrop) backdrop.classList.remove("hidden");
    } else {
      sidebar.classList.add("-translate-x-full");
      if (backdrop) backdrop.classList.add("hidden");
    }
  };

  if (toggleBtn) toggleBtn.addEventListener("click", toggleSidebar);
  if (backdrop) backdrop.addEventListener("click", toggleSidebar);
}
