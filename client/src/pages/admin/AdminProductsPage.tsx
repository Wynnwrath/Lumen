import { useState } from "react";
import { Icon } from "../../components/common/Icon";
import { deleteProduct, updateProduct } from "../../api/products";
import type { Product } from "../../types";
import { Button } from "../../components/common/Button";
import { KpiCard } from "../../components/common/KpiCard";
import { SearchInput } from "../../components/common/SearchInput";
import { EmptyState } from "../../components/common/EmptyState";
import { ListRowsSkeleton } from "../../components/common/skeletons";
import { useToast } from "../../components/common/ToastProvider";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useProductForm } from "../../hooks/useProductForm";
import { ProductFormModal } from "./products/ProductFormModal";
import { FALLBACK_PRODUCT_IMAGE } from "../../constants";

export const AdminProductsPage = () => {
  const { products, refresh: refreshProducts, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const {
    showModal,
    setShowModal,
    editingProduct,
    formName,
    setFormName,
    formCategory,
    setFormCategory,
    formPrice,
    setFormPrice,
    formOriginalPrice,
    setFormOriginalPrice,
    formStock,
    setFormStock,
    formStatus,
    setFormStatus,
    formImage,
    setFormImage,
    imageUploading,
    formDescription,
    setFormDescription,
    handleOpenAddModal,
    handleOpenEditModal,
    handleImageFile,
    handleSaveProduct,
  } = useProductForm(categories, refreshProducts);

  // KPI calculations
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.stock > 0).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;
  const inventoryValuation = products.reduce((acc, p) => acc + p.price * p.stock, 0);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await deleteProduct(id);
        showToast(`Deleted product "${name}"`, "info");
        await refreshProducts();
      } catch (error) {
        showToast("Failed to delete product", "error");
      }
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === "active" ? "inactive" : "active";
    try {
      await updateProduct(p._id, { status: newStatus });
      showToast(`Changed status of "${p.name}" to ${newStatus}`, "info");
      await refreshProducts();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
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
      if (!p.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Top Catalog KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 w-full">
        {/* Total Products */}
        <KpiCard
          label="Total Products"
          chip="Active"
          chipClassName="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
          value={totalProducts}
          subtext="Catalog items count"
          id="stat-total-products"
        />

        {/* In Stock */}
        <KpiCard
          label="In Stock"
          chip="Available"
          chipClassName="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          value={inStockProducts}
          valueClassName="text-emerald-600 dark:text-emerald-400"
          subtext="Ready for dispatch"
          id="stat-active-products"
        />

        {/* Out of Stock */}
        <KpiCard
          label="Out of Stock"
          chip="Low Stock"
          chipClassName="bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
          value={outOfStockProducts}
          valueClassName="text-amber-600 dark:text-amber-400"
          subtext="Requires reorder"
          id="stat-out-stock"
        />

        {/* Inventory Value */}
        <KpiCard
          label="Inventory Value"
          chip="Valuation"
          chipClassName="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
          value={`$${inventoryValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          valueClassName="font-mono text-blue-600 dark:text-blue-400"
          subtext="Total stock value"
          id="stat-inventory-val"
        />
      </section>

      {/* Filter Controls Bar */}
      <section className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-none">
        {/* Search Input */}
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search product name..." id="catalog-search" />

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

          <Button variant="blue" icon="add" onClick={handleOpenAddModal}>
            Add Product
          </Button>
        </div>
      </section>

      {/* Products Content Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      {productsLoading ? (
        <ListRowsSkeleton rows={6} />
      ) : (
      <section className="space-y-4">
        {/* Mobile View: Refined Responsive Card Layout matching rounded-none style */}
        <div className="block md:hidden space-y-3">
          {filtered.length === 0 ? (
            <EmptyState text="No products found matching your filter criteria." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none" />
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
                    src={product.images[0] || FALLBACK_PRODUCT_IMAGE}
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
                        <Icon name="delete" className="text-lg" />
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
                  <EmptyState text="No products found matching your filter criteria." className="py-12 text-center text-sm text-slate-500 dark:text-slate-400" colSpan={6} />
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || FALLBACK_PRODUCT_IMAGE}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{product.name}</p>
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
                            <Icon name="edit" className="text-base" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Icon name="delete" className="text-base" />
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
      )}

      {/* Add / Edit Product Modal (SalesSync 2-Column UI 1-to-1) */}
      <ProductFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editingProduct={editingProduct}
        categories={categories}
        showToast={showToast}
        formName={formName}
        setFormName={setFormName}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formPrice={formPrice}
        setFormPrice={setFormPrice}
        formOriginalPrice={formOriginalPrice}
        setFormOriginalPrice={setFormOriginalPrice}
        formStock={formStock}
        setFormStock={setFormStock}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formImage={formImage}
        setFormImage={setFormImage}
        imageUploading={imageUploading}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        handleImageFile={handleImageFile}
        handleSaveProduct={handleSaveProduct}
      />
    </div>
  );
};

export default AdminProductsPage;
