import React, { useState, useMemo } from "react";
import { createCategory, updateCategory, deleteCategory } from "../../api/categories";
import { getErrorMessage } from "../../api/client";
import type { Category, Product } from "../../types";
import { Icon } from "../../components/ui/Icon";
import { Button } from "../../components/ui/Button";
import { KpiCard } from "../../components/admin/shared/KpiCard";
import { Modal } from "../../components/ui/Modal";
import { SearchInput } from "../../components/admin/shared/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSpinner } from "../../components/ui/skeletons";
import { AdminPagination } from "../../components/admin/shared/AdminPagination";
import { AdminToolbar } from "../../components/admin/shared/AdminToolbar";
import { RowActions, type RowAction } from "../../components/admin/shared/RowActions";
import { ProductImage } from "../../components/ui/ProductImage";
import { useToast } from "../../components/ui/ToastProvider";
import { usePagination } from "../../hooks/usePagination";
import { useCategories } from "../../hooks/useCategories";
import { useProducts } from "../../hooks/useProducts";
import { formatMoney } from "../../utils/format";

// Admin category CRUD with product-assignment counts and a delete guard.
export const AdminCategoriesPage = () => {
  const { categories, refresh: refreshCategories, loading: categoriesLoading } = useCategories();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("devices");
  const [formDescription, setFormDescription] = useState("");

  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<string | null>(null);

  // Products belonging to a category (matches slug, id, or name).
  const getCategoryProducts = (cat: Category): Product[] =>
    products.filter(
      (p) =>
        p.category === cat.slug ||
        p.category === cat._id ||
        (p.category && p.category.toLowerCase() === cat.name.toLowerCase()) ||
        (p.category && p.category.toLowerCase() === cat.slug.toLowerCase())
    );

  const viewProducts = viewCategory ? getCategoryProducts(viewCategory) : [];

  // Memoized Product Counts per Category (single pass, equivalent to the old O(N·M) getAssignedCount)
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cat of categories) {
      let count = 0;
      for (const p of products) {
        if (
          p.category === cat.slug ||
          p.category === cat._id ||
          (p.category && p.category.toLowerCase() === cat.name.toLowerCase()) ||
          (p.category && p.category.toLowerCase() === cat.slug.toLowerCase())
        ) {
          count += 1;
        }
      }
      counts.set(cat._id, count);
    }
    return counts;
  }, [categories, products]);

  const totalCategorizedProducts = categories.reduce(
    (sum, cat) => sum + (categoryCounts.get(cat._id) ?? 0),
    0
  );

  let topCategoryName = "None";
  let maxCount = -1;
  for (const cat of categories) {
    const count = categoryCounts.get(cat._id) ?? 0;
    if (count > maxCount) {
      topCategoryName = cat.name;
      maxCount = count;
    }
  }

  // Filter categories by search
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { page, setPage, totalPages, totalItems, start, end, paginated } = usePagination(filteredCategories, 10);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormIcon("devices");
    setFormDescription("");
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon || "devices");
    setFormDescription(cat.description || "");
    setShowModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const catData = {
      name: formName,
      slug: editingCategory ? editingCategory.slug : formName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      icon: formIcon,
      description: formDescription,
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.slug, catData);
        showToast(`Updated category "${formName}"`, "success");
      } else {
        await createCategory(catData);
        showToast(`Created new category "${formName}"`, "success");
      }
      await refreshCategories();
    } catch (error) {
      showToast("Failed to save category", "error");
    }

    setShowModal(false);
  };

  const handleDeleteCategory = async (cat: Category) => {
    setDeleteBlockedMessage(null);
    try {
      await deleteCategory(cat.slug);
      showToast("Category deleted successfully", "info");
      await refreshCategories();
    } catch (error) {
      const message = getErrorMessage(error);
      setDeleteBlockedMessage(
        message === "Something went wrong. Please try again."
          ? `Cannot delete category "${cat.name}" because active products are assigned to it.`
          : message
      );
    }
  };

  // Row actions shared by the mobile card and the desktop table.
  const getCategoryActions = (cat: Category): RowAction[] => [
    { label: "View Products", icon: "view_list", onClick: () => setViewCategory(cat) },
    { label: "Edit", icon: "edit", onClick: () => handleOpenEditModal(cat) },
    { label: "Delete", icon: "delete", danger: true, onClick: () => handleDeleteCategory(cat) },
  ];

  return (
    <div className="h-full min-h-0 flex flex-col gap-5 sm:gap-6 w-full">
      {/* Metrics Overview Cards Section */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 w-full shrink-0">
        {/* Total Categories Stat Card */}
        <KpiCard
          label="Total Categories"
          chip="Active"
          chipClassName="bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
          value={categories.length}
          subtext="Taxonomy groups"
          id="stat-total-categories"
        />

        {/* Total Assigned Products */}
        <KpiCard
          label="Products Categorized"
          chip="Assigned"
          chipClassName="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
          value={totalCategorizedProducts}
          valueClassName="text-blue-600 dark:text-blue-400"
          subtext="Catalog items linked"
          id="stat-categorized-products"
        />

        {/* Most Popular Category */}
        <KpiCard
          label="Top Category"
          chip="Popular"
          chipClassName="bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
          value={topCategoryName}
          valueClassName="text-lg sm:text-2xl"
          subtext="Highest item count"
          id="stat-top-category"
          className="col-span-2 sm:col-span-1"
        />
      </section>

      {/* Search & Actions Bar */}
      <div className="shrink-0">
        <AdminToolbar
          search={<SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search category title or description..." id="category-search" />}
          actions={
            <Button variant="blue" icon="add" onClick={handleOpenAddModal}>
              Add Category
            </Button>
          }
        />
      </div>

      {/* Categories Content Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      {categoriesLoading ? (
        <LoadingSpinner label="Loading categories..." />
      ) : (
      <section className="flex-1 min-h-0 overflow-y-auto space-y-4">
        {/* Mobile View: Flush Responsive Card Stack matching rounded-none style */}
        <div className="block md:hidden space-y-3">
          {filteredCategories.length === 0 ? (
            <EmptyState message="No categories found matching your search." card />
          ) : (
            paginated.map((cat) => {
              const count = categoryCounts.get(cat._id) ?? 0;
              return (
                <div
                  key={cat._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex items-center gap-3.5 transition-colors rounded-none"
                >
                  {/* Category Icon Box */}
                  <div className="w-20 h-20 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/60 rounded-md">
                    <Icon name={cat.icon || "category"} className="text-2xl" />
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
                    {/* Top Row: Category Title & Row Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight">
                        {cat.name}
                      </h4>
                      <RowActions actions={getCategoryActions(cat)} />
                    </div>

                    {/* Subtitle: Slug */}
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-400 -mt-1 truncate">
                      /{cat.slug}
                    </p>

                    {/* Bottom Row: Items Count */}
                    <div className="flex items-center justify-end gap-2 mt-auto">
                      {count > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                          {count} items
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                          0 items
                        </span>
                      )}
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
                  <th className="px-5 py-4">Category Name</th>
                  <th className="px-5 py-4">Identifier / Slug</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Assigned Products</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800">
                  {filteredCategories.length === 0 ? (
                    <EmptyState message="No categories found matching your search." colSpan={5} />
                  ) : (
                  paginated.map((cat) => {
                    const count = categoryCounts.get(cat._id) ?? 0;

                    return (
                      <tr
                        key={cat._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                              <Icon name={cat.icon || "category"} className="text-lg" />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-slate-100">{cat.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {cat.slug}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-medium max-w-xs truncate">
                          {cat.description || "No description provided."}
                        </td>
                        <td className="px-5 py-4">
                          {count > 0 ? (
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {count} products
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              0 products
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <RowActions actions={getCategoryActions(cat)} />
                        </td>
                      </tr>
                    );
                  })
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

      {/* Add / Edit Category Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? "Edit Category Taxonomy" : "Add New Category Taxonomy"}
        subtitle="Configure catalog taxonomy and icon mapping"
        icon={<Icon name={formIcon || "category"} className="text-xl" />}
        className="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="blue" type="submit" form="category-form">Save Category</Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSaveCategory} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category Title *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Gaming Gear"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Icon Style *</label>
                <select
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition cursor-pointer"
                >
                  <option value="devices">Electronics &amp; Tech</option>
                  <option value="checkroom">Fashion &amp; Apparel</option>
                  <option value="chair">Home &amp; Living</option>
                  <option value="spa">Beauty &amp; Skincare</option>
                  <option value="shopping_basket">Groceries</option>
                  <option value="diamond">Luxury &amp; Fine Items</option>
                  <option value="sports_esports">Gaming</option>
                  <option value="watch">Watches &amp; Accessories</option>
                  <option value="book">Books &amp; Stationery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short summary of products in this category..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>
        </form>
      </Modal>

      {/* View Category Products Modal */}
      <Modal
        open={!!viewCategory}
        onClose={() => setViewCategory(null)}
        title={viewCategory ? `${viewCategory.name}` : ""}
        subtitle={viewCategory ? `${viewProducts.length} product(s) in this category` : ""}
        icon={<Icon name={viewCategory?.icon || "category"} className="text-xl" />}
        className="max-w-2xl"
        footer={
          <Button variant="outline" onClick={() => setViewCategory(null)}>Close</Button>
        }
      >
        {viewProducts.length === 0 ? (
          <EmptyState message="No products assigned to this category yet." />
        ) : (
          <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
            {viewProducts.map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <ProductImage
                  src={p.images[0]}
                  alt={p.name}
                  className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {formatMoney(p.price)} &bull; {p.stock} in stock
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${p.stock === 0 ? "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800" : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"}`}>
                  {p.stock === 0 ? "Out" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Deletion Blocked Warning Modal */}
      <Modal
        open={!!deleteBlockedMessage}
        onClose={() => setDeleteBlockedMessage(null)}
        title="Deletion Blocked"
        icon={<Icon name="warning" className="text-3xl text-amber-600" />}
        headerIconClassName="bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-full w-14 h-14"
        footer={<Button fullWidth onClick={() => setDeleteBlockedMessage(null)}>Understood</Button>}
      >
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{deleteBlockedMessage}</p>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
