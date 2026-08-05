// Customer Management Admin Logic for Lumen E-Commerce

document.addEventListener("DOMContentLoaded", () => {
  // Enforce Seller Authentication Guard
  if (window.lumenStore && typeof window.lumenStore.requireSellerAuth === "function") {
    const isAuth = window.lumenStore.requireSellerAuth();
    if (!isAuth) return;
  }

  // Application State
  let currentPage = 1;
  const pageSize = 10;
  let searchQuery = "";
  let statusFilter = "all";
  let sortFilter = "name_asc";

  // Elements
  const searchInput = document.getElementById("customer-search-input");
  const statusSelect = document.getElementById("customer-status-filter");
  const sortSelect = document.getElementById("customer-sort-filter");
  const customerListContainer = document.getElementById("customer-list-container");

  // Modals & Forms
  const modalCustomer = document.getElementById("modal-customer");
  const formCustomer = document.getElementById("form-customer");
  const btnOpenAdd = document.getElementById("btn-open-add-customer");
  const btnCloseAdd = document.getElementById("btn-close-customer-modal");
  const btnCancelAdd = document.getElementById("btn-cancel-customer");
  const modalTitle = document.getElementById("modal-customer-title");

  // Profile Modal
  const modalProfile = document.getElementById("modal-profile");
  const btnCloseProfile = document.getElementById("btn-close-profile-modal");
  const btnDoneProfile = document.getElementById("btn-done-profile");

  // Pagination Elements
  const btnPrevPage = document.getElementById("btn-prev-page");
  const btnNextPage = document.getElementById("btn-next-page");
  const paginationNumbers = document.getElementById("pagination-numbers");
  const paginationInfo = document.getElementById("customer-pagination-info");

  // Initialize Page
  initTheme();
  setupSidebarNavigation();
  renderCustomerOverview();

  // Search & Filter Event Listeners
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      currentPage = 1;
      renderCustomerOverview();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener("change", (e) => {
      statusFilter = e.target.value;
      currentPage = 1;
      renderCustomerOverview();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortFilter = e.target.value;
      currentPage = 1;
      renderCustomerOverview();
    });
  }

  // Add Customer Modal Handlers
  if (btnOpenAdd) {
    btnOpenAdd.addEventListener("click", () => {
      openAddCustomerModal();
    });
  }

  if (btnCloseAdd) btnCloseAdd.addEventListener("click", closeCustomerModal);
  if (btnCancelAdd) btnCancelAdd.addEventListener("click", closeCustomerModal);
  if (formCustomer) formCustomer.addEventListener("submit", handleCustomerFormSubmit);

  // Profile Modal Handlers
  if (btnCloseProfile) btnCloseProfile.addEventListener("click", closeProfileModal);
  if (btnDoneProfile) btnDoneProfile.addEventListener("click", closeProfileModal);

  // Pagination Handlers
  if (btnPrevPage) {
    btnPrevPage.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderCustomerOverview();
      }
    });
  }

  if (btnNextPage) {
    btnNextPage.addEventListener("click", () => {
      const customers = getFilteredCustomers();
      const maxPage = Math.ceil(customers.length / pageSize) || 1;
      if (currentPage < maxPage) {
        currentPage++;
        renderCustomerOverview();
      }
    });
  }

  // Core Render Function
  function renderCustomerOverview() {
    const allCustomers = window.lumenStore.getCustomers() || [];

    // Calculate Summary Stats
    const totalCount = allCustomers.length;
    const activeCount = allCustomers.filter(c => c.status === "Active" || c.status === "VIP").length;
    const totalRev = allCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgSpend = totalCount > 0 ? (totalRev / totalCount) : 0;

    // Update KPI UI Elements
    updateElementText("stat-total-customers", totalCount.toLocaleString());
    updateElementText("stat-active-members", activeCount.toLocaleString());
    updateElementText("stat-total-revenue", `$${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    updateElementText("stat-avg-spend", `$${avgSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    // Filter & Sort
    const filtered = getFilteredCustomers();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageCustomers = filtered.slice(startIndex, endIndex);

    // Render Table List Rows
    renderCustomerList(pageCustomers);

    // Render Pagination Controls
    renderPagination(totalItems, startIndex, endIndex, totalPages);
  }

  function getFilteredCustomers() {
    let list = window.lumenStore.getCustomers() || [];

    // Search filter
    if (searchQuery) {
      list = list.filter((c) => 
        (c.name && c.name.toLowerCase().includes(searchQuery)) ||
        (c.email && c.email.toLowerCase().includes(searchQuery)) ||
        (c.phone && c.phone.toLowerCase().includes(searchQuery))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }

    // Sort filter
    list.sort((a, b) => {
      if (sortFilter === "name_asc") return a.name.localeCompare(b.name);
      if (sortFilter === "spent_desc") return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (sortFilter === "orders_desc") return (b.orderCount || 0) - (a.orderCount || 0);
      if (sortFilter === "date_desc") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });

    return list;
  }

  function renderCustomerList(customers) {
    if (!customerListContainer) return;

    if (customers.length === 0) {
      customerListContainer.innerHTML = `
        <div class="py-12 text-center text-slate-500 dark:text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2 text-slate-400 block">search_off</span>
          <p class="text-sm font-bold">No matching customer profiles found.</p>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
        </div>
      `;
      return;
    }

    customerListContainer.innerHTML = customers.map((c) => {
      const avatarSrc = c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=2563eb&color=fff`;
      const initials = c.name ? c.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";
      
      let statusBadgeClasses = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      if (c.status === "Active") {
        statusBadgeClasses = "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      } else if (c.status === "VIP") {
        statusBadgeClasses = "bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      } else if (c.status === "Suspended") {
        statusBadgeClasses = "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      } else if (c.status === "Inactive") {
        statusBadgeClasses = "bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      }

      const formattedSpent = `$${(c.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition gap-3">
          
          <!-- Left: Customer Name & Avatar -->
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="relative shrink-0">
              <img 
                src="${avatarSrc}" 
                alt="${c.name}" 
                onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=2563eb&color=fff';"
                class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
              <span class="w-2.5 h-2.5 rounded-full ${c.status === 'Active' || c.status === 'VIP' ? 'bg-emerald-500' : 'bg-slate-400'} absolute bottom-0 right-0 border-2 border-white dark:border-slate-900"></span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">${c.name}</span>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${statusBadgeClasses}">
                  ${c.status || "Active"}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${c.email}</p>
            </div>
          </div>

          <!-- Middle: Contact Phone & Order Spend Stats -->
          <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700/60">
            
            <div class="text-left sm:text-right hidden md:block">
              <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">${c.phone || "+1 (555) 000-0000"}</p>
              <p class="text-[10px] text-slate-400 truncate max-w-[140px]">${c.address || "New York, NY"}</p>
            </div>

            <div class="text-left sm:text-right">
              <p class="text-xs font-black text-slate-900 dark:text-white font-mono">${formattedSpent}</p>
              <p class="text-[10px] font-semibold text-blue-600 dark:text-blue-400">${c.orderCount || 0} orders placed</p>
            </div>

            <!-- Action Buttons matching Reference Image -->
            <div class="flex items-center gap-1 shrink-0">
              <button 
                onclick="window.viewCustomerProfile('${c.id}')"
                class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition" 
                title="View Profile & Orders"
              >
                <span class="material-symbols-outlined text-lg">visibility</span>
              </button>

              <button 
                onclick="window.openEditCustomerModal('${c.id}')"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition" 
                title="Edit Customer"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>

              <button 
                onclick="window.deleteCustomerItem('${c.id}')"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition" 
                title="Delete Customer"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>

          </div>

        </div>
      `;
    }).join("");
  }

  function renderPagination(totalItems, startIndex, endIndex, totalPages) {
    if (!paginationInfo || !paginationNumbers) return;

    const displayStart = totalItems === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(endIndex, totalItems);

    paginationInfo.textContent = `Showing ${displayStart} to ${displayEnd} of ${totalItems} customers`;

    if (btnPrevPage) btnPrevPage.disabled = currentPage <= 1;
    if (btnNextPage) btnNextPage.disabled = currentPage >= totalPages;

    let numHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        numHTML += `<button class="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">${i}</button>`;
      } else {
        numHTML += `<button onclick="window.goToCustomerPage(${i})" class="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center">${i}</button>`;
      }
    }
    paginationNumbers.innerHTML = numHTML;
  }

  window.goToCustomerPage = function(page) {
    currentPage = page;
    renderCustomerOverview();
  };

  // Add / Edit Modal Functions
  function openAddCustomerModal() {
    if (!modalCustomer || !formCustomer) return;
    formCustomer.reset();
    document.getElementById("customer-edit-id").value = "";
    if (modalTitle) modalTitle.textContent = "Add New Customer";
    modalCustomer.classList.remove("hidden");
  }

  window.openEditCustomerModal = function(id) {
    const customers = window.lumenStore.getCustomers() || [];
    const customer = customers.find(c => c.id === id);
    if (!customer || !modalCustomer || !formCustomer) return;

    document.getElementById("customer-edit-id").value = customer.id;
    document.getElementById("cust-name").value = customer.name || "";
    document.getElementById("cust-email").value = customer.email || "";
    document.getElementById("cust-phone").value = customer.phone || "";
    document.getElementById("cust-status").value = customer.status || "Active";
    document.getElementById("cust-avatar").value = customer.avatar || "";
    document.getElementById("cust-address").value = customer.address || "";

    if (modalTitle) modalTitle.textContent = `Edit Profile: ${customer.name}`;
    modalCustomer.classList.remove("hidden");
  };

  function closeCustomerModal() {
    if (modalCustomer) modalCustomer.classList.add("hidden");
  }

  function handleCustomerFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById("customer-edit-id").value;
    const name = document.getElementById("cust-name").value.trim();
    const email = document.getElementById("cust-email").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const status = document.getElementById("cust-status").value;
    const avatar = document.getElementById("cust-avatar").value.trim();
    const address = document.getElementById("cust-address").value.trim();

    if (!name || !email) {
      showToast("Name and Email are required fields.", "info");
      return;
    }

    if (editId) {
      const res = window.lumenStore.updateCustomer(editId, { name, email, phone, status, avatar, address });
      if (res.success) {
        showToast(`Updated customer profile for ${name}`, "success");
      } else {
        showToast(res.message, "info");
        return;
      }
    } else {
      const res = window.lumenStore.addCustomer({ name, email, phone, status, avatar, address });
      if (res.success) {
        showToast(`Added new customer ${name}`, "success");
      } else {
        showToast(res.message, "info");
        return;
      }
    }

    closeCustomerModal();
    renderCustomerOverview();
  }

  // Detailed Customer Profile Drawer
  window.viewCustomerProfile = function(id) {
    const customers = window.lumenStore.getCustomers() || [];
    const customer = customers.find(c => c.id === id);
    if (!customer || !modalProfile) return;

    // Populate Modal Elements
    const avatar = customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=2563eb&color=fff`;
    document.getElementById("profile-avatar").src = avatar;
    document.getElementById("profile-name").textContent = customer.name;
    document.getElementById("profile-email").textContent = customer.email;
    document.getElementById("profile-phone").textContent = customer.phone || "Not provided";
    document.getElementById("profile-address").textContent = customer.address || "Not provided";

    document.getElementById("profile-order-count").textContent = customer.orderCount || 0;
    document.getElementById("profile-total-spent").textContent = `$${(customer.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let badgeClass = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
    if (customer.status === "Active") badgeClass = "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
    else if (customer.status === "VIP") badgeClass = "bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800";
    else if (customer.status === "Suspended") badgeClass = "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800";

    document.getElementById("profile-status-badge").innerHTML = `
      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeClass}">
        ${customer.status || "Active"}
      </span>
    `;

    // Render Order History
    const ordersContainer = document.getElementById("profile-orders-list");
    if (ordersContainer) {
      if (!customer.orders || customer.orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="p-4 text-center text-slate-400 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            No order history recorded for this customer yet.
          </div>
        `;
      } else {
        ordersContainer.innerHTML = customer.orders.map(o => `
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <p class="font-extrabold text-slate-900 dark:text-white">Order ${o.orderNumber || o.id}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">${new Date(o.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300">
                ${o.orderStatus || 'Completed'}
              </span>
              <span class="font-mono font-black text-slate-900 dark:text-white">
                $${(Number(o.total) || 0).toFixed(2)}
              </span>
            </div>
          </div>
        `).join("");
      }
    }

    modalProfile.classList.remove("hidden");
  };

  function closeProfileModal() {
    if (modalProfile) modalProfile.classList.add("hidden");
  }

  // Safe Customer Deletion Handler with Order Guardrail
  window.deleteCustomerItem = function(id) {
    const customers = window.lumenStore.getCustomers() || [];
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    // Call store deletion
    const res = window.lumenStore.deleteCustomer(id);
    if (!res.success) {
      if (res.hasOrders) {
        showToast(res.message, "info");
      } else {
        showToast(res.message, "info");
      }
      return;
    }

    showToast(`Removed customer profile ${customer.name}`, "success");
    renderCustomerOverview();
  };

  // Sidebar & Layout Controls
  function setupSidebarNavigation() {
    const logoutBtn = document.getElementById("btn-admin-logout");
    const mobileToggleBtn = document.getElementById("sidebar-mobile-toggle");
    const sidebar = document.getElementById("admin-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

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

    if (mobileToggleBtn) mobileToggleBtn.addEventListener("click", toggleSidebar);
    if (backdrop) backdrop.addEventListener("click", toggleSidebar);
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem("lumen_theme") || "light";
    const html = document.documentElement;
    const toggleIcon = document.getElementById("theme-toggle-icon");
    const toggleBtn = document.getElementById("theme-toggle");

    if (savedTheme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
      if (toggleIcon) toggleIcon.textContent = "light_mode";
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
      if (toggleIcon) toggleIcon.textContent = "dark_mode";
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const isDark = html.classList.contains("dark");
        if (isDark) {
          html.classList.remove("dark");
          html.classList.add("light");
          localStorage.setItem("lumen_theme", "light");
          if (toggleIcon) toggleIcon.textContent = "dark_mode";
        } else {
          html.classList.add("dark");
          html.classList.remove("light");
          localStorage.setItem("lumen_theme", "dark");
          if (toggleIcon) toggleIcon.textContent = "light_mode";
        }
      });
    }
  }

  // Utility Functions
  function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

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
});
