import React from "react";
import { Icon } from "../../../components/common/Icon";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { AdminField } from "./AdminField";
import { ProductImage } from "../../../components/common/ProductImage";
import type { Category, Product, ToastMessage } from "../../../types";
import type { ProductStatus } from "../../../hooks/useProductForm";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: Category[];
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  formName: string;
  setFormName: React.Dispatch<React.SetStateAction<string>>;
  formCategory: string;
  setFormCategory: React.Dispatch<React.SetStateAction<string>>;
  formPrice: string;
  setFormPrice: React.Dispatch<React.SetStateAction<string>>;
  formOriginalPrice: string;
  setFormOriginalPrice: React.Dispatch<React.SetStateAction<string>>;
  formStock: string;
  setFormStock: React.Dispatch<React.SetStateAction<string>>;
  formStatus: ProductStatus;
  setFormStatus: React.Dispatch<React.SetStateAction<ProductStatus>>;
  formImage: string;
  setFormImage: React.Dispatch<React.SetStateAction<string>>;
  imageUploading: boolean;
  formDescription: string;
  setFormDescription: React.Dispatch<React.SetStateAction<string>>;
  handleImageFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProduct: (e: React.FormEvent) => void;
}

export const ProductFormModal = ({
  open,
  onClose,
  editingProduct,
  categories,
  showToast,
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
  handleImageFile,
  handleSaveProduct,
}: ProductFormModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingProduct ? "Edit Product" : "Add New Product"}
      subtitle="Create or modify product details for the Lumen catalog"
      icon={<Icon name="inventory_2" className="text-xl" />}
      className="max-w-4xl"
      headerActions={
        <>
          <Button variant="blue" onClick={() => showToast("Draft saved to memory", "info")} className="hidden sm:flex">
            <Icon name="bookmark" className="text-sm" />Save Draft
          </Button>
          <Button variant="blue" type="submit" form="product-form">
            <Icon name="check" className="text-sm" />{editingProduct ? "Save Changes" : "Add Product"}
          </Button>
        </>
      }
    >
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

              <AdminField label="Product Name *">
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Puffer Jacket With Pocket Detail"
                  className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </AdminField>

              <AdminField label="Description Product">
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed specs, fabric details, features, or materials..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </AdminField>
            </div>

            {/* Card 2: Pricing And Stock */}
            <div className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pricing And Stock
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <AdminField label="Base Pricing ($) *">
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
                </AdminField>
                <AdminField label="Original Price ($)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="60.00"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-mono font-bold rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </AdminField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <AdminField label="Stock Quantity *">
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="77"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-mono font-bold rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </AdminField>
                <AdminField label="Product Status *">
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProductStatus)}
                    required
                    className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="active">Active (Visible on Storefront)</option>
                    <option value="inactive">Inactive (Hidden from Customers)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </AdminField>
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
                <ProductImage
                  src={formImage}
                  alt="Product Preview"
                  className="w-full h-full object-cover rounded-xl transition duration-300"
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
                  <ProductImage src={formImage} className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                  <ProductImage className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  <Icon name="add" className="text-lg" />
                </div>
              </div>

              <AdminField label="Upload from Device">
                <label
                  className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-xs font-bold transition cursor-pointer ${
                    imageUploading
                      ? "border-slate-300 dark:border-slate-600 text-slate-400"
                      : "border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  }`}
                >
                  <Icon name={imageUploading ? "loader" : "upload"} className="text-base" />
                  <span>{imageUploading ? "Uploading..." : "Choose Image File"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} disabled={imageUploading} />
                </label>
              </AdminField>

              <AdminField label="Image URL Address">
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Paste an image URL (e.g. https://...)"
                  className="w-full bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </AdminField>
            </div>

            {/* Card 4: Category */}
            <div className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Category
              </h4>

              <AdminField label="Product Category *">
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
              </AdminField>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
