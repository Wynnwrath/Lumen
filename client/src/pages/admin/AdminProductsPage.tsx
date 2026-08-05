import React, { useState } from "react";
import { dataService } from "../../services/dataService";
import type { Product } from "../../types";

interface Toast {
  id: number;
  message: string;
  type: "info" | "success";
}

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(dataService.getProducts());
  const categories = dataService.getCategories();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("electronics");
  const [formBrand, setFormBrand] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive" | "out_of_stock">("active");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "info" | "success" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const refreshProducts = () => {
    setProducts(dataService.getProducts());
  };

  // KPI calculations
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.stock > 0).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;
  const inventoryValuation = products.reduce((acc, p) => acc + p.price * p.stock, 0);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory(categories[0]?.slug || "electronics");
    setFormBrand("");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStock("");
    setFormStatus("active");
    setFormImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80");
    setFormDescription("");
    setShowModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBrand(p.brand || "");
    setFormPrice(p.price.toString());
    setFormOriginalPrice((p.originalPrice || p.price).toString());
    setFormStock(p.stock.toString());
    setFormStatus(p.status || (p.stock > 0 ? "active" : "out_of_stock"));
    setFormImage(p.images[0] || "");
    setFormDescription(p.description || "");
    setShowModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(formPrice) || 0;
    const stockNum = Number(formStock) || 0;
    const payload: Partial<Product> = {
      name: formName,
      category: formCategory,
      brand: formBrand || "Lumen",
      price: priceNum,
      originalPrice: Number(formOriginalPrice) || priceNum,
      stock: stockNum,
      status: stockNum <= 0 && formStatus !== "inactive" ? "out_of_stock" : formStatus,
      images: [formImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
      description: formDescription || "Product from Lumen catalog.",
    };

    if (editingProduct) {
      dataService.updateProduct(editingProduct._id, payload);
      showToast(`Updated product "${formName}"`, "success");
    } else {
      dataService.addProduct(payload);
      showToast(`Created new product "${formName}"`, "success");
    }

    refreshProducts();
    setShowModal(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      dataService.deleteProduct(id);
      showToast(`Deleted product "${name}"`, "info");
      refreshProducts();
    }
  };

  const handleToggleStatus = (p: Product) => {
    const newStatus = p.status === "active" ? "inactive" : "active";
    dataService.updateProduct(p._id, { status: newStatus });
    showToast(`Changed status of "${p.name}" to ${newStatus}`, "info");
    refreshProducts();
  };

  // Filtered Products
  const filtered = products.filter((p) => {
    // Category Filter
    if (categoryFilter !== "all" && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    // Stock Filter
    if (stockFilter === "instock" && p.stock <= 4) return false;
    if (stockFilter === "lowstock" && (p.stock < 1 || p.stock >= 5)) return false;
    if (stockFilter === "outofstock" && p.stock !== 0) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.brand || "").toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold max-w-sm border pointer-events-auto transition-all duration-200 ${toast.type === "success"
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-slate-200"
              }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === "success" ? "check_circle" : "info"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Top Catalog KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 w-full">
        {/* Total Products */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Total Products</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
              Active
            </span>
          </div>
          <div>
            <div id="stat-total-products" className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalProducts}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Catalog items count</p>
          </div>
        </div>

        {/* In Stock */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">In Stock</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Available
            </span>
          </div>
          <div>
            <div id="stat-active-products" className="text-xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {inStockProducts}
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-300/80 font-medium mt-1">Ready for dispatch</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Out of Stock</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              Low Stock
            </span>
          </div>
          <div>
            <div id="stat-out-stock" className="text-xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {outOfStockProducts}
            </div>
            <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-300/80 font-medium mt-1">Requires reorder</p>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Inventory Value</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
              Valuation
            </span>
          </div>
          <div>
            <div id="stat-inventory-val" className="text-xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
              ${inventoryValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Total stock value</p>
          </div>
        </div>
      </section>

      {/* Filter Controls Bar */}
      <section className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-none">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
          <input
            id="catalog-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product name or brand..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            id="catalog-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 sm:flex-initial bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            id="catalog-stock-filter"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="flex-1 sm:flex-initial bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">All Stock Status</option>
            <option value="instock">In Stock (&gt;5)</option>
            <option value="lowstock">Low Stock (1-4)</option>
            <option value="outofstock">Out of Stock (0)</option>
          </select>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs transition shrink-0"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Product</span>
          </button>
        </div>
      </section>

      {/* Products Content Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      <section className="space-y-4">
        {/* Mobile View: Refined Responsive Card Layout matching rounded-none style */}
        <div className="block md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none">
              No products found matching your filter criteria.
            </div>
          ) : (
            filtered.map((product) => {
              const isStockActive = product.status === "active" && product.stock > 0;
              return (
                <div
                  key={product._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex items-center gap-3.5 transition-colors rounded-none"
                >
                  {/* Square Product Image */}
                  <img
                    src={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"}
                    alt={product.name}
                    className="w-20 h-20 rounded-md object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800/80"
                  />

                  {/* Product Metadata & Action Bar */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
                    {/* Top Row: Product Name & Trash Icon */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => handleDeleteProduct(product._id, product.name)}
                        className="p-1 text-rose-400 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition shrink-0 -mr-1 -mt-1"
                        title="Delete Product"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>

                    {/* Price Subtitle */}
                    <p className="font-semibold text-xs text-slate-400 dark:text-slate-400 -mt-1 font-mono">
                      ${product.price.toFixed(2).replace(/\.00$/, "")}
                    </p>

                    {/* Bottom Row: Quick Edit Pill Button & In Stock Toggle Switch */}
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 text-xs font-extrabold hover:bg-blue-100 transition border border-blue-100 dark:border-blue-800/60 shadow-2xs"
                      >
                        Quick Edit
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-400">
                          {isStockActive ? "In Stock" : product.stock === 0 ? "Out of Stock" : "Inactive"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isStockActive ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          title="Toggle Stock/Status"
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              isStockActive ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Multi-Column Table (screen >= md) */}
        <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 shadow-sm overflow-hidden rounded-none">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock Units</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="products-tbody" className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      No products found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{product.name}</p>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">{product.brand || "Lumen Store"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-extrabold text-slate-900 dark:text-white">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        {product.stock === 0 ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            0 units (Out)
                          </span>
                        ) : product.stock < 5 ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            {product.stock} units (Low)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {product.stock} units
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition ${product.status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}
                        >
                          {product.status.toUpperCase()}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                            title="Edit Product"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete Product"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add / Edit Product Modal (SalesSync 2-Column UI 1-to-1) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in-scale">
            {/* Modal Header Bar */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">inventory_2</span>
                </div>
                <div>
                  <h3 id="modal-title" className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Create or modify product details for the Lumen catalog
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Draft saved to memory", "info");
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                  <span>Save Draft</span>
                </button>
                <button
                  type="submit"
                  form="product-form"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span id="btn-save-label">{editingProduct ? "Save Changes" : "Add Product"}</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-2"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body Form (2 Columns Layout) */}
            <form id="product-form" onSubmit={handleSaveProduct} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                {/* Left Column (General Information + Pricing & Stock) - 7 cols */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Card 1: General Information */}
                  <div className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      General Information
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Puffer Jacket With Pocket Detail"
                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description Product</label>
                      <textarea
                        rows={4}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Detailed specs, fabric details, features, or materials..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Card 2: Pricing And Stock */}
                  <div className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Pricing And Stock
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Base Pricing ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="47.55"
                          className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-mono font-bold rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Original Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formOriginalPrice}
                          onChange={(e) => setFormOriginalPrice(e.target.value)}
                          placeholder="60.00"
                          className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-mono font-bold rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Stock Quantity *</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formStock}
                          onChange={(e) => setFormStock(e.target.value)}
                          placeholder="77"
                          className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-mono font-bold rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product Status * (PDF Spec)</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          required
                          className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                          <option value="active">Active (Visible on Storefront)</option>
                          <option value="inactive">Inactive (Hidden from Customers)</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (Media Upload & Category) - 5 cols */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Card 3: Upload Img Preview Canvas */}
                  <div className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Upload Img
                    </h4>

                    {/* Primary Canvas Image Box */}
                    <div className="relative w-full h-48 sm:h-52 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 group">
                      <img
                        src={formImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"}
                        alt="Product Preview"
                        className="w-full h-full object-cover rounded-xl transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 backdrop-blur-xs">
                        <span className="px-3 py-1.5 bg-white/90 text-slate-900 text-xs font-extrabold rounded-lg shadow-sm">
                          Live Preview
                        </span>
                      </div>
                    </div>

                    {/* Interactive Thumbnail Strip */}
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-blue-600/10 border-2 border-blue-600 overflow-hidden shrink-0">
                        <img
                          src={formImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=200&q=80"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        <span className="material-symbols-outlined text-lg">add</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Image URL Address</label>
                      <input
                        type="url"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Card 4: Category & Brand */}
                  <div className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Category & Brand
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product Category *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        required
                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Brand / Manufacturer</label>
                      <input
                        type="text"
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        placeholder="e.g. Nike, Sony, Apple"
                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
