import React, { useState } from "react";
import { dataService } from "../../services/dataService";
import type { Category } from "../../types";

interface Toast {
  id: number;
  message: string;
  type: "info" | "success";
}

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(dataService.getCategories());
  const [products] = useState(dataService.getProducts());
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("devices");
  const [formDescription, setFormDescription] = useState("");

  const [pdfWarningMessage, setPdfWarningMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "info" | "success" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const refreshCategories = () => {
    setCategories(dataService.getCategories());
  };

  // Calculate Product Counts per Category
  const getAssignedCount = (cat: Category) => {
    return products.filter(
      (p) =>
        p.category === cat.slug ||
        p.category === cat._id ||
        (p.category && p.category.toLowerCase() === cat.name.toLowerCase()) ||
        (p.category && p.category.toLowerCase() === cat.slug.toLowerCase())
    ).length;
  };

  const totalCategorizedProducts = categories.reduce((sum, cat) => sum + getAssignedCount(cat), 0);

  let topCategoryName = "None";
  let maxCount = -1;
  categories.forEach((cat) => {
    const count = getAssignedCount(cat);
    if (count > maxCount) {
      maxCount = count;
      topCategoryName = cat.name;
    }
  });

  // Filter categories by search
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const catData = {
      name: formName,
      slug: editingCategory ? editingCategory.slug : formName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      icon: formIcon,
      description: formDescription,
    };

    if (editingCategory) {
      const updated = dataService.updateCategory(editingCategory._id, catData);
      if (updated) {
        showToast(`Updated category "${formName}"`, "success");
      }
    } else {
      const created = dataService.addCategory(catData);
      if (created) {
        showToast(`Created new category "${formName}"`, "success");
      }
    }

    refreshCategories();
    setShowModal(false);
  };

  const handleDeleteCategory = (cat: Category) => {
    setPdfWarningMessage(null);
    const result = dataService.deleteCategory(cat._id);

    if (!result.success) {
      // PDF Guardrail Requirement Warning Modal trigger
      setPdfWarningMessage(result.message || `Cannot delete category "${cat.name}" because active products are assigned to it.`);
      return;
    }

    showToast("Category deleted successfully", "info");
    refreshCategories();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Toast Container */}
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

      {/* Metrics Overview Cards Section */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 w-full">
        {/* Total Categories Stat Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Total Categories</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
              Active
            </span>
          </div>
          <div>
            <div id="stat-total-categories" className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {categories.length}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Taxonomy groups</p>
          </div>
        </div>

        {/* Total Assigned Products */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Products Categorized</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Assigned
            </span>
          </div>
          <div>
            <div id="stat-categorized-products" className="text-xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
              {totalCategorizedProducts}
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-300/80 font-medium mt-1">Catalog items linked</p>
          </div>
        </div>

        {/* Most Popular Category */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Top Category</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              Popular
            </span>
          </div>
          <div>
            <div id="stat-top-category" className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
              {topCategoryName}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Highest item count</p>
          </div>
        </div>
      </section>

      {/* Search & Actions Bar */}
      <section className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-none">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
          <input
            id="category-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category title or description..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs transition shrink-0"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Category</span>
          </button>
        </div>
      </section>

      {/* Categories Content Section: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      <section className="space-y-4">
        {/* Mobile View: Flush Responsive Card Stack matching rounded-none style */}
        <div className="block md:hidden space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none">
              No categories found matching your search.
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const count = getAssignedCount(cat);
              return (
                <div
                  key={cat._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex items-center gap-3.5 transition-colors rounded-none"
                >
                  {/* Category Icon Box */}
                  <div className="w-20 h-20 bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/60 rounded-md">
                    <span className="material-symbols-outlined text-2xl">{cat.icon || "category"}</span>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
                    {/* Top Row: Category Title & Trash Icon */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate tracking-tight">
                        {cat.name}
                      </h4>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1 text-rose-400 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition shrink-0 -mr-1 -mt-1"
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>

                    {/* Subtitle: Slug */}
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-400 -mt-1 truncate">
                      /{cat.slug}
                    </p>

                    {/* Bottom Row: Quick Edit Pill & Items Count */}
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 text-xs font-extrabold hover:bg-blue-100 transition border border-blue-100 dark:border-blue-800/60 shadow-2xs"
                      >
                        Quick Edit
                      </button>

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
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4">Category Name</th>
                  <th className="px-5 py-4">Identifier / Slug</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Assigned Products</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      No categories found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const count = getAssignedCount(cat);

                    return (
                      <tr
                        key={cat._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs sm:text-sm border-b border-dashed border-slate-200 dark:border-slate-800"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                              <span className="material-symbols-outlined text-lg">{cat.icon || "category"}</span>
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(cat)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                              title="Edit Category"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                              title="Delete Category"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
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

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-scale my-auto">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">{formIcon || "category"}</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingCategory ? "Edit Category Taxonomy" : "Add New Category Taxonomy"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Configure catalog taxonomy and icon mapping
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
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
                  <option value="devices">devices (Electronics & Tech)</option>
                  <option value="checkroom">checkroom (Fashion & Apparel)</option>
                  <option value="chair">chair (Home & Living)</option>
                  <option value="spa">spa (Beauty & Skincare)</option>
                  <option value="shopping_basket">shopping_basket (Groceries)</option>
                  <option value="diamond">diamond (Luxury & Fine Items)</option>
                  <option value="sports_esports">sports_esports (Gaming)</option>
                  <option value="watch">watch (Watches & Accessories)</option>
                  <option value="book">book (Books & Stationery)</option>
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

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deletion Blocked Warning Modal (PDF Guardrail Spec) */}
      {pdfWarningMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl border border-amber-200 dark:border-amber-800">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Deletion Blocked (PDF Requirement)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {pdfWarningMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setPdfWarningMessage(null)}
                type="button"
                className="w-full py-2.5 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
