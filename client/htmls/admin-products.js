// Admin Product Catalog Controller for Lumen E-Commerce

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  verifySellerSession();
  renderCatalog();
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

// Render Products Catalog Table & Stats
function renderCatalog() {
  const products = window.lumenStore.getProducts();

  // 1. Calculate Summary Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => (p.stock || 0) > 0).length;
  const outOfStock = products.filter((p) => (p.stock || 0) <= 0).length;
  const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

  const statTotal = document.getElementById("stat-total-products");
  const statActive = document.getElementById("stat-active-products");
  const statOut = document.getElementById("stat-out-stock");
  const statVal = document.getElementById("stat-inventory-val");

  if (statTotal) statTotal.textContent = totalProducts.toLocaleString();
  if (statActive) statActive.textContent = activeProducts.toLocaleString();
  if (statOut) statOut.textContent = outOfStock.toLocaleString();
  if (statVal) statVal.textContent = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 2. Filter & Search Logic
  const searchQuery = (document.getElementById("catalog-search")?.value || "").toLowerCase().trim();
  const categoryFilter = document.getElementById("catalog-category-filter")?.value || "all";
  const stockFilter = document.getElementById("catalog-stock-filter")?.value || "all";

  let filtered = products.filter((p) => {
    const nameMatches = (p.name || p.title || "").toLowerCase().includes(searchQuery) ||
                        (p.brand || "").toLowerCase().includes(searchQuery);
    
    let categoryMatches = true;
    if (categoryFilter !== "all") {
      categoryMatches = p.category === categoryFilter;
    }

    let stockMatches = true;
    if (stockFilter === "instock") {
      stockMatches = (p.stock || 0) >= 5;
    } else if (stockFilter === "lowstock") {
      stockMatches = (p.stock || 0) > 0 && (p.stock || 0) < 5;
    } else if (stockFilter === "outofstock") {
      stockMatches = (p.stock || 0) <= 0;
    }

    return nameMatches && categoryMatches && stockMatches;
  });

  // 3. Render Table Rows
  const tbody = document.getElementById("products-tbody");
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No products matched your catalog search.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((product) => {
    const name = product.name || product.title || "Product";
    const imgSrc = (product.images && product.images.length > 0)
      ? product.images[0]
      : (product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80");

    let stockBadgeHTML = `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">${product.stock} units</span>`;
    let statusBadgeHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active</span>`;

    if (product.status === "inactive") {
      statusBadgeHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Inactive</span>`;
    } else if ((product.stock || 0) <= 0 || product.status === "out_of_stock") {
      stockBadgeHTML = `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">0 units</span>`;
      statusBadgeHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Out of stock</span>`;
    } else if ((product.stock || 0) < 5) {
      stockBadgeHTML = `<span class="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800">${product.stock} units</span>`;
    }

    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800">
        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <img src="${imgSrc}" alt="${name}" class="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"/>
            <div>
              <p class="font-bold text-slate-900 dark:text-slate-100">${name}</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">${product.brand || "Lumen Store"}</p>
            </div>
          </div>
        </td>
        <td class="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium capitalize">
          ${product.category}
        </td>
        <td class="px-5 py-4 font-extrabold text-slate-900 dark:text-white font-mono">
          $${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td class="px-5 py-4">
          ${stockBadgeHTML}
        </td>
        <td class="px-5 py-4">
          ${statusBadgeHTML}
        </td>
        <td class="px-5 py-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="editProduct('${product.id}')" class="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition" title="Edit Product">
              <span class="material-symbols-outlined text-base">edit</span>
            </button>
            <button onclick="confirmDeleteProduct('${product.id}', '${name.replace(/'/g, "\\'")}')" class="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition" title="Delete Product">
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
  const searchInput = document.getElementById("catalog-search");
  const categoryFilter = document.getElementById("catalog-category-filter");
  const stockFilter = document.getElementById("catalog-stock-filter");
  const imageInput = document.getElementById("form-image");

  if (searchInput) searchInput.addEventListener("input", renderCatalog);
  if (categoryFilter) categoryFilter.addEventListener("change", renderCatalog);
  if (stockFilter) stockFilter.addEventListener("change", renderCatalog);

  // Live Image Preview Canvas Updates
  if (imageInput) {
    imageInput.addEventListener("input", (e) => {
      const url = e.target.value.trim();
      const mainPreview = document.getElementById("modal-image-preview");
      const thumb1 = document.getElementById("modal-thumb-1");
      if (url && mainPreview) {
        mainPreview.src = url;
        if (thumb1) thumb1.src = url;
      }
    });
  }

  // Modal Controls
  const openModalBtn = document.getElementById("btn-open-add-modal");
  const closeModalBtn = document.getElementById("btn-close-modal");
  const cancelModalBtn = document.getElementById("btn-cancel-modal");
  const saveDraftBtn = document.getElementById("btn-save-draft");
  const productForm = document.getElementById("product-form");

  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
      openAddModal();
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
      const statusSelect = document.getElementById("form-status");
      if (statusSelect) statusSelect.value = "inactive";
      saveProductForm(true);
    });
  }

  if (productForm) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault();
      saveProductForm(false);
    });
  }

  // Mobile sidebar toggle
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
  const modal = document.getElementById("product-modal");
  const modalTitle = document.getElementById("modal-title");
  const saveLabel = document.getElementById("btn-save-label");
  const form = document.getElementById("product-form");
  
  if (form) form.reset();
  document.getElementById("form-product-id").value = "";
  if (modalTitle) modalTitle.textContent = "Add New Product";
  if (saveLabel) saveLabel.textContent = "Add Product";
  
  const defaultImg = "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80";
  const mainPreview = document.getElementById("modal-image-preview");
  const thumb1 = document.getElementById("modal-thumb-1");
  if (mainPreview) mainPreview.src = defaultImg;
  if (thumb1) thumb1.src = defaultImg;

  if (modal) modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.classList.add("hidden");
}

// Global Edit & Delete Helpers
window.editProduct = function(productId) {
  const product = window.lumenStore.getProductById(productId);
  if (!product) return;

  document.getElementById("form-product-id").value = product.id;
  document.getElementById("form-name").value = product.name || product.title || "";
  document.getElementById("form-brand").value = product.brand || "";
  document.getElementById("form-category").value = product.category || "electronics";
  document.getElementById("form-price").value = product.price || 0;
  if (document.getElementById("form-original-price")) {
    document.getElementById("form-original-price").value = product.originalPrice || product.price || 0;
  }
  document.getElementById("form-stock").value = product.stock || 0;
  if (document.getElementById("form-status")) {
    document.getElementById("form-status").value = product.status || (product.stock > 0 ? "active" : "out_of_stock");
  }
  
  const imgSrc = (product.images && product.images.length > 0) ? product.images[0] : (product.image || "");
  document.getElementById("form-image").value = imgSrc;
  document.getElementById("form-description").value = product.description || "";

  const mainPreview = document.getElementById("modal-image-preview");
  const thumb1 = document.getElementById("modal-thumb-1");
  if (imgSrc && mainPreview) mainPreview.src = imgSrc;
  if (imgSrc && thumb1) thumb1.src = imgSrc;

  const modalTitle = document.getElementById("modal-title");
  const saveLabel = document.getElementById("btn-save-label");
  if (modalTitle) modalTitle.textContent = "Edit Product";
  if (saveLabel) saveLabel.textContent = "Update Product";

  const modal = document.getElementById("product-modal");
  if (modal) modal.classList.remove("hidden");
};

function saveProductForm(isDraft = false) {
  const productId = document.getElementById("form-product-id").value;
  const name = document.getElementById("form-name").value || "Untitled Product";
  const brand = document.getElementById("form-brand").value || "Lumen";
  const category = document.getElementById("form-category").value || "electronics";
  const price = parseFloat(document.getElementById("form-price").value) || 0;
  const originalPrice = parseFloat(document.getElementById("form-original-price")?.value) || price;
  const stock = parseInt(document.getElementById("form-stock").value, 10) || 0;
  let status = document.getElementById("form-status")?.value || (stock > 0 ? "active" : "out_of_stock");
  if (isDraft) status = "inactive";

  const image = document.getElementById("form-image").value;
  const description = document.getElementById("form-description").value;

  const productData = { name, brand, category, price, originalPrice, stock, status, image, description };

  if (productId) {
    const res = window.lumenStore.updateProduct(productId, productData);
    if (res.success) {
      showToast(isDraft ? `Saved "${name}" as draft` : `Updated "${name}" successfully`, "success");
    }
  } else {
    const res = window.lumenStore.addProduct(productData);
    if (res.success) {
      showToast(isDraft ? `Saved "${name}" as draft` : `Added "${name}" to product catalog`, "success");
    }
  }

  closeModal();
  renderCatalog();
}

window.confirmDeleteProduct = function(productId, productName) {
  if (confirm(`Are you sure you want to delete "${productName}" from the store catalog?`)) {
    const res = window.lumenStore.deleteProduct(productId);
    if (res.success) {
      showToast(`Deleted "${productName}"`, "info");
      renderCatalog();
    }
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
