// Admin Dashboard Overview Controller for Lumen E-Commerce

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  verifySellerSession();
  renderDashboardOverview();
  setupSidebarNavigation();
});

// Theme Toggle Initialization (Syncs seamlessly with global localStorage "theme")
function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  themeToggleBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Session Guard
function verifySellerSession() {
  const session = window.lumenStore.getSellerSession();
  const storeNameEl = document.getElementById("admin-store-name");
  const emailEl = document.getElementById("admin-email");
  const avatarEl = document.getElementById("admin-avatar-initials");

  if (!session) {
    // Default demo session if accessed directly
    const demoSession = {
      id: "s1",
      storeName: "Lumen Official Store",
      email: "admin@lumen.com",
      role: "admin",
      category: "electronics"
    };
    localStorage.setItem("lumen_seller_session", JSON.stringify(demoSession));
  }

  const currentSession = window.lumenStore.getSellerSession();
  if (storeNameEl) storeNameEl.textContent = currentSession.storeName;
  if (emailEl) emailEl.textContent = currentSession.email;
  if (avatarEl) {
    const initials = currentSession.storeName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    avatarEl.textContent = initials || "LO";
  }
}

// Render Dashboard Metrics, Charts & Tables
function renderDashboardOverview() {
  const stats = window.lumenStore.getDashboardStats();

  const avgOrderValue = stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0;
  const fulfillmentRate = stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0;

  // 1. Prominent KPI Metrics
  const kpiSales = document.getElementById("kpi-sales");
  const kpiOrders = document.getElementById("kpi-orders");
  const kpiAvgOrder = document.getElementById("kpi-avg-order");
  const kpiPending = document.getElementById("kpi-pending");
  const kpiCompleted = document.getElementById("kpi-completed");

  if (kpiSales) kpiSales.textContent = `$${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (kpiOrders) kpiOrders.textContent = stats.totalOrders.toLocaleString();
  if (kpiAvgOrder) kpiAvgOrder.textContent = `$${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (kpiPending) kpiPending.textContent = stats.pendingOrders;
  if (kpiCompleted) kpiCompleted.textContent = stats.completedOrders;

  // Funnel & Conversion Stats
  const funnelRateEl = document.getElementById("funnel-fulfillment-rate");
  if (funnelRateEl) funnelRateEl.textContent = `${fulfillmentRate}%`;

  // 2. Low Stock Alerts Banner
  renderLowStockAlerts(stats.lowStockItems);

  // 3. Recent Orders Table
  renderRecentOrdersTable();
}

// Render Low Stock Warning List with Dual Light/Dark Styling
function renderLowStockAlerts(lowStockItems) {
  const container = document.getElementById("low-stock-container");
  const countBadge = document.getElementById("low-stock-count");
  if (!container) return;

  if (!lowStockItems || lowStockItems.length === 0) {
    if (countBadge) countBadge.textContent = "0";
    container.innerHTML = `
      <div class="py-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
        <span class="material-symbols-outlined text-emerald-500 text-3xl mb-1 block">check_circle</span>
        All products are sufficiently stocked.
      </div>
    `;
    return;
  }

  if (countBadge) countBadge.textContent = lowStockItems.length;

  container.innerHTML = lowStockItems.map((item) => {
    const name = item.name || item.title || "Lumen Product";
    const imgSrc = (item.images && item.images.length > 0) 
      ? item.images[0] 
      : (item.image || "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80");

    return `
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${imgSrc}" alt="${name}" class="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"/>
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-900 dark:text-white truncate">${name}</p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 capitalize">${item.category || "General"}</p>
          </div>
        </div>
        <div class="flex items-center gap-2.5 shrink-0">
          <span class="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            ${item.stock} left
          </span>
          <button onclick="restockItem('${item.id}')" class="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs">
            Restock
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Quick Restock Helper
window.restockItem = function(productId) {
  const products = window.lumenStore.getProducts();
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.stock = (product.stock || 0) + 10;
    if (product.status === "out_of_stock") product.status = "active";
    window.lumenStore.saveProducts(products);
    showToast(`Restocked +10 units for ${product.name || product.title}`, "success");
    renderDashboardOverview();
  }
};

// Render Recent Orders Data Table with Dual Light/Dark Styling
function renderRecentOrdersTable() {
  const tbody = document.getElementById("recent-orders-tbody");
  if (!tbody) return;

  const orders = window.lumenStore.getOrders();
  if (!orders || orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No orders recorded yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map((order) => {
    const formattedDate = new Date(order.orderDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });

    const statusBadge = getStatusBadgeHTML(order.orderStatus);

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800">
        <td class="px-5 py-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
          ${order.orderNumber}
        </td>
        <td class="px-5 py-4">
          <div class="font-bold text-slate-900 dark:text-slate-100">${order.customerName}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">${order.customerEmail || "N/A"}</div>
        </td>
        <td class="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">
          ${formattedDate}
        </td>
        <td class="px-5 py-4 font-extrabold text-slate-900 dark:text-white font-mono">
          $${Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs align-middle inline-block ml-0.5">north_east</span>
        </td>
        <td class="px-5 py-4">
          ${statusBadge}
        </td>
        <td class="px-5 py-4">
          <select onchange="updateOrderStatusFromTable('${order.orderNumber}', this.value)" class="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:border-blue-500 shadow-xs">
            <option value="Pending" ${order.orderStatus === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Confirmed" ${order.orderStatus === "Confirmed" ? "selected" : ""}>Confirmed</option>
            <option value="Preparing" ${order.orderStatus === "Preparing" ? "selected" : ""}>Preparing</option>
            <option value="Shipped" ${order.orderStatus === "Shipped" ? "selected" : ""}>Shipped</option>
            <option value="Completed" ${order.orderStatus === "Completed" ? "selected" : ""}>Completed</option>
            <option value="Cancelled" ${order.orderStatus === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
      </tr>
    `;
  }).join("");
}

// Generate Crisp Status Badge HTML with Dual Theme Colors
function getStatusBadgeHTML(status) {
  let colorClasses = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

  switch (status) {
    case "Pending":
      colorClasses = "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      break;
    case "Confirmed":
      colorClasses = "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      break;
    case "Preparing":
      colorClasses = "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      break;
    case "Shipped":
      colorClasses = "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      break;
    case "Completed":
      colorClasses = "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      break;
    case "Cancelled":
      colorClasses = "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      break;
  }

  return `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${colorClasses}">
      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>${status}</span>
    </span>
  `;
}

// Table Order Status Update Handler
window.updateOrderStatusFromTable = function(orderNumber, newStatus) {
  const res = window.lumenStore.updateOrderStatus(orderNumber, newStatus);
  if (res.success) {
    showToast(`Order ${orderNumber} status updated to ${newStatus}`, "success");
    renderDashboardOverview();
  } else {
    showToast(res.message, "info");
  }
};

// Sidebar Navigation Controls
function setupSidebarNavigation() {
  const logoutBtn = document.getElementById("btn-admin-logout");
  const mobileToggleBtn = document.getElementById("sidebar-mobile-toggle");
  const sidebar = document.getElementById("admin-sidebar");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.lumenStore.logoutSeller();
      showToast("Signed out of Admin Dashboard", "info");
      setTimeout(() => {
        window.location.href = "admin-login.html";
      }, 800);
    });
  }

  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
    });
  }
}

// Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");

  let icon = "info";
  let bgClass = "bg-slate-900 dark:bg-white text-white dark:text-slate-900";
  if (type === "success") {
    icon = "check_circle";
    bgClass = "bg-blue-600 text-white";
  }

  toast.className = `toast-animate-in ${bgClass} px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold max-w-sm border border-slate-700 dark:border-slate-200 pointer-events-auto`;
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
