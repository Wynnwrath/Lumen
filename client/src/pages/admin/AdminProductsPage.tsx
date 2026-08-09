import { useState } from "react";
import { deleteProduct, updateProduct } from "../../api/products";
import type { Product } from "../../types";
import { Button } from "../../components/ui/Button";
import { KpiCard } from "../../components/admin/shared/KpiCard";
import { SearchInput } from "../../components/admin/shared/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { AdminListSkeleton } from "../../components/ui/skeletons";
import { AdminPagination } from "../../components/admin/shared/AdminPagination";
import { AdminToolbar } from "../../components/admin/shared/AdminToolbar";
import { RowActions, type RowAction } from "../../components/admin/shared/RowActions";
import { ToggleSwitch } from "../../components/admin/shared/ToggleSwitch";
import { ProductImage } from "../../components/ui/ProductImage";
import { useToast } from "../../components/ui/ToastProvider";
import { usePagination } from "../../hooks/usePagination";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useProductForm } from "../../hooks/useProductForm";
import { formatMoney, formatMoneyCompact } from "../../utils/format";
import { ADMIN_LOW_STOCK_THRESHOLD } from "../../constants";
import { ProductFormModal } from "../../components/admin/products/ProductFormModal";

// Admin product CRUD: list, search, toggle status, add/edit via modal (useProductForm).
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
    formIsSale,
    setFormIsSale,
    formArrival,
    setFormArrival,
    handleOpenAddModal,
    handleOpenEditModal,
    handleImageChange,
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
      await updateProduct(p.id, { status: newStatus });
      showToast(`Changed status of "${p.name}" to ${newStatus}`, "info");
      await refreshProducts();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  // Row actions shared by the mobile card and the desktop table.
  const getProductActions = (product: Product): RowAction[] => [
    { label: "Edit", icon: "edit", onClick: () => handleOpenEditModal(product) },
    { label: "Delete", icon: "delete", danger: true, onClick: () => handleDeleteProduct(product.id, product.name) },
  ];

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    // Category Filter
    if (categoryFilter !== "all" && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    // Stock Filter
    if (stockFilter === "instock" && p.stock <= ADMIN_LOW_STOCK_THRESHOLD - 1) return false;
    if (stockFilter === "lowstock" && (p.stock < 1 || p.stock >= ADMIN_LOW_STOCK_THRESHOLD)) return false;
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

  const { page, setPage, totalPages, totalItems, start, end, paginated } = usePagination(filteredProducts, 10);

  return (
    <div className="md:h-full md:min-h-0 flex flex-col gap-5 sm:gap-6 w-full">
      {/* Top Catalog KPI Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 w-full shrink-0">
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
          value={formatMoney(inventoryValuation)}
          valueClassName="font-mono text-blue-600 dark:text-blue-400"
          subtext="Total stock value"
          id="stat-inventory-val"
        />
      </section>

      {/* Filter Controls Bar */}
      <div className="shrink-0">
        <AdminToolbar
          search={<SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search product name..." id="catalog-search" />}
          actions={
            <>
              <select
                id="catalog-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 sm:flex-initial bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

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
            </>
          }
        />
      </div>

      {/* Products Content Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      {productsLoading ? (
        <AdminListSkeleton rows={6} />
      ) : (
      <section className="md:flex-1 md:min-h-0 md:overflow-y-auto space-y-4">
        {/* Mobile View: Refined Responsive Card Layout matching rounded-none style */}
        <div className="block md:hidden space-y-3">
          {filteredProducts.length === 0 ? (
            <EmptyState message="No products found matching your filter criteria." card />
          ) : (
            paginated.map((product) => {
              const isStockActive = product.status === "active" && product.stock > 0;
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex items-center gap-3.5 transition-colors rounded-none"
                >
                  {/* Square Product Image */}
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-20 rounded-md object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800/80"
                  />

                  {/* Product Metadata & Action Bar */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
                    {/* Top Row: Product Name & Row Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight">
                        {product.name}
                      </h4>
                      <RowActions actions={getProductActions(product)} />
                    </div>

                    {/* Price Subtitle */}
                    <p className="font-semibold text-xs text-slate-400 dark:text-slate-400 -mt-1 font-mono">
                      {formatMoneyCompact(product.price)}
                    </p>

                    {/* Bottom Row: In Stock Toggle Switch */}
                    <div className="flex items-center justify-end gap-2 mt-auto">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-400">
                          {isStockActive ? "In Stock" : product.stock === 0 ? "Out of Stock" : "Inactive"}
                        </span>
                        <ToggleSwitch checked={isStockActive} onChange={() => handleToggleStatus(product)} />
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
                <tr className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock Units</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="products-tbody" className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <EmptyState message="No products found matching your filter criteria." colSpan={6} />
                ) : (
                  paginated.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono font-extrabold text-slate-900 dark:text-white">
                        {formatMoney(product.price)}
                      </td>
                      <td className="px-5 py-3">
                        {product.stock === 0 ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            0 units (Out)
                          </span>
                        ) : product.stock < ADMIN_LOW_STOCK_THRESHOLD ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            {product.stock} units (Low)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {product.stock} units
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
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
                      <td className="px-5 py-3 text-right">
                        <RowActions actions={getProductActions(product)} />
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

      <div className="shrink-0">
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          start={start}
          end={end}
          onChange={setPage}
        />
      </div>

      {/* Add / Edit Product Modal (SalesSync 2-Column UI 1-to-1) */}
      <ProductFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editingProduct={editingProduct}
        categories={categories}
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
        formIsSale={formIsSale}
        setFormIsSale={setFormIsSale}
        formArrival={formArrival}
        setFormArrival={setFormArrival}
        handleImageChange={handleImageChange}
        handleSaveProduct={handleSaveProduct}
      />
    </div>
  );
};

export default AdminProductsPage;
