// Admin Category Management Controller for Lumen E-Commerce

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  verifySellerSession();
  renderCategories();
  setupEventListeners();
});

// Theme Initialization
function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem("lumen_theme") || "light";
  if (currentTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  themeToggleBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("lumen_theme", isDark ? "dark" : "light");
  });
}

// Session Guard
function verifySellerSession() {
  const session = window.lumenStore.getSellerSession();
  const storeNameEl = document.getElementById("admin-store-name");
  const emailEl = document.getElementById("admin-email");
  const avatarEl = document.getElementById("admin-avatar-initials");

  if (!session) {
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

// Render Categories Grid / Table & Metrics
function renderCategories() {
  const categories = window.lumenStore.getCategories();
  const products = window.lumenStore.getProducts();

  // Calculate Product Counts per Category
  const categoryCounts = {};
  let totalCategorizedProducts = 0;

  categories.forEach((cat) => {
    const count = products.filter(
      (p) => p.category === cat.slug || p.category === cat.id || (p.category && p.category.toLowerCase() === cat.name.toLowerCase())
    ).length;
    categoryCounts[cat.id] = count;
    totalCategorizedProducts += count;
  });

  // Calculate Top Category
  let topCatName = "None";
  let maxCount = -1;
  categories.forEach((cat) => {
    const c = categoryCounts[cat.id] || 0;
    if (c > maxCount) {
      maxCount = c;
      topCatName = cat.name;
    }
  });

  // Update Summary Stats
  const statTotal = document.getElementById("stat-total-categories");
  const statCategorized = document.getElementById("stat-categorized-products");
  const statTop = document.getElementById("stat-top-category");

  if (statTotal) statTotal.textContent = categories.length;
  if (statCategorized) statCategorized.textContent = totalCategorizedProducts;
  if (statTop) statTop.textContent = topCatName;

  // Search Filter
  const searchQuery = (document.getElementById("category-search")?.value || "").toLowerCase().trim();
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery) ||
    c.slug.toLowerCase().includes(searchQuery) ||
    (c.description || "").toLowerCase().includes(searchQuery)
  );

  const tbody = document.getElementById("categories-tbody");
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No categories found matching your search.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((cat) => {
    const count = categoryCounts[cat.id] || 0;
    let badgeHTML = `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">${count} products</span>`;
    if (count === 0) {
      badgeHTML = `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">0 products</span>`;
    }

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800">
        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
              <span class="material-symbols-outlined text-lg">${cat.icon || 'category'}</span>
            </div>
            <div>
              <p class="font-extrabold text-slate-900 dark:text-slate-100">${cat.name}</p>
            </div>
          </div>
        </td>
        <td class="px-5 py-4">
          <span class="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ${cat.slug}
          </span>
        </td>
        <td class="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-medium max-w-xs truncate">
          ${cat.description || "No description provided."}
        </td>
        <td class="px-5 py-4">
          ${badgeHTML}
        </td>
        <td class="px-5 py-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="editCategory('${cat.id}')" class="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition" title="Edit Category">
              <span class="material-symbols-outlined text-base">edit</span>
            </button>
            <button onclick="confirmDeleteCategory('${cat.id}')" class="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition" title="Delete Category">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Setup Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById("category-search");
  if (searchInput) searchInput.addEventListener("input", renderCategories);

  // Modal Controls
  const openModalBtn = document.getElementById("btn-open-add-category");
  const closeModalBtn = document.getElementById("btn-close-cat-modal");
  const cancelModalBtn = document.getElementById("btn-cancel-cat-modal");
  const closeWarningBtn = document.getElementById("btn-close-warning");
  const categoryForm = document.getElementById("category-form");

  if (openModalBtn) openModalBtn.addEventListener("click", openAddModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
  if (closeWarningBtn) closeWarningBtn.addEventListener("click", closeWarningModal);

  if (categoryForm) {
    categoryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      saveCategoryForm();
    });
  }

  // Mobile Sidebar Toggle
  const mobileToggleBtn = document.getElementById("sidebar-mobile-toggle");
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

  if (mobileToggleBtn) mobileToggleBtn.addEventListener("click", toggleSidebar);
  if (backdrop) backdrop.addEventListener("click", toggleSidebar);

  // Logout
  const logoutBtn = document.getElementById("btn-admin-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.lumenStore.logoutSeller();
      showToast("Signed out", "info");
      setTimeout(() => { window.location.href = "admin-login.html"; }, 600);
    });
  }
}

// Modal Helpers
function openAddModal() {
  const modal = document.getElementById("category-modal");
  const title = document.getElementById("cat-modal-title");
  const form = document.getElementById("category-form");

  if (form) form.reset();
  document.getElementById("form-cat-id").value = "";
  if (title) title.textContent = "Add New Category";
  if (modal) modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("category-modal");
  if (modal) modal.classList.add("hidden");
}

function closeWarningModal() {
  const warningModal = document.getElementById("deletion-warning-modal");
  if (warningModal) warningModal.classList.add("hidden");
}

// Edit & Delete Handlers
window.editCategory = function(catId) {
  const cat = window.lumenStore.getCategoryById(catId);
  if (!cat) return;

  document.getElementById("form-cat-id").value = cat.id;
  document.getElementById("form-cat-name").value = cat.name || "";
  document.getElementById("form-cat-icon").value = cat.icon || "category";
  document.getElementById("form-cat-description").value = cat.description || "";

  const title = document.getElementById("cat-modal-title");
  if (title) title.textContent = "Edit Category";

  const modal = document.getElementById("category-modal");
  if (modal) modal.classList.remove("hidden");
};

function saveCategoryForm() {
  const catId = document.getElementById("form-cat-id").value;
  const name = document.getElementById("form-cat-name").value.trim();
  const icon = document.getElementById("form-cat-icon").value;
  const description = document.getElementById("form-cat-description").value.trim();

  const catData = { name, icon, description };

  if (catId) {
    const res = window.lumenStore.updateCategory(catId, catData);
    if (res.success) {
      showToast(`Updated category "${name}"`, "success");
    }
  } else {
    const res = window.lumenStore.addCategory(catData);
    if (res.success) {
      showToast(`Created new category "${name}"`, "success");
    }
  }

  closeModal();
  renderCategories();
}

// PDF Requirement: Deletion protection when assigned to products
window.confirmDeleteCategory = function(catId) {
  const res = window.lumenStore.deleteCategory(catId);
  
  if (!res.success && res.isAssigned) {
    // Show PDF Requirement Warning Modal!
    const warningText = document.getElementById("deletion-warning-text");
    if (warningText) {
      warningText.textContent = res.message;
    }
    const warningModal = document.getElementById("deletion-warning-modal");
    if (warningModal) warningModal.classList.remove("hidden");
    return;
  }

  if (res.success) {
    showToast("Category deleted successfully", "info");
    renderCategories();
  }
};

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
