import React from "react";
import { Icon } from "../../ui/Icon";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { ToggleSwitch } from "../../admin/shared/ToggleSwitch";
import { ProductImage } from "../../ui/ProductImage";
import type { Category, Product, ProductStatus } from "../../../types";

// Shared control styles — matched with the coupon/category admin modals so
// every form input looks and feels the same.
const inputClass =
  "w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition";
const monoInputClass =
  "w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition";
const selectClass =
  "w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/20 transition cursor-pointer";

const labelClass = "block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5";

// Card shell + section header shared by the four form sections.
const SectionCard = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
    <h4 className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
      <span className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <Icon name={icon} className="text-sm" />
      </span>
      {title}
    </h4>
    {children}
  </div>
);

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: Category[];
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
  formIsSale: boolean;
  setFormIsSale: React.Dispatch<React.SetStateAction<boolean>>;
  formArrival: boolean;
  setFormArrival: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProduct: (e: React.FormEvent) => void;
}

export const ProductFormModal = ({
  open,
  onClose,
  editingProduct,
  categories,
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
  handleImageChange,
  handleSaveProduct,
}: ProductFormModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingProduct ? "Edit Product" : "Add New Product"}
      subtitle={editingProduct ? `Update "${editingProduct.name}"` : "Create a new product for the Lumen catalog"}
      icon={<Icon name="inventory_2" className="text-xl" />}
      className="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="blue" type="submit" form="product-form">
            <Icon name="check" className="text-sm" />
            {editingProduct ? "Save Changes" : "Add Product"}
          </Button>
        </>
      }
    >
      {/* Modal body already provides padding + scroll; the form only owns spacing. */}
      <form id="product-form" onSubmit={handleSaveProduct} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: General Information + Pricing & Stock */}
          <div className="lg:col-span-7 space-y-5">
            <SectionCard icon="info" title="General Information">
              <div>
                <label className={labelClass}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Puffer Jacket With Pocket Detail"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Product Description</label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed specs, fabric details, features, or materials..."
                  className={inputClass}
                />
              </div>
            </SectionCard>

            <SectionCard icon="payments" title="Pricing & Stock">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="47.55"
                    className={monoInputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="60.00"
                    className={monoInputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="77"
                    className={monoInputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Product Status *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProductStatus)}
                    required
                    className={selectClass}
                  >
                    <option value="active">Active (Visible on Storefront)</option>
                    <option value="inactive">Inactive (Hidden from Customers)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">On Sale</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Show sale badge</p>
                  </div>
                  <ToggleSwitch checked={formIsSale} onChange={() => setFormIsSale((v) => !v)} />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">New Arrival</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Show &quot;New&quot; badge</p>
                  </div>
                  <ToggleSwitch checked={formArrival} onChange={() => setFormArrival((v) => !v)} />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right Column: Upload Image + Category */}
          <div className="lg:col-span-5 space-y-5">
            <SectionCard icon="image" title="Upload Image">
              {/* Preview Canvas */}
              <div className="relative w-full h-48 sm:h-52 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 group">
                <ProductImage
                  src={formImage}
                  alt="Product Preview"
                  className="w-full h-full object-cover rounded-xl transition duration-300"
                />
                {formImage && (
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 backdrop-blur-xs">
                    <span className="px-3 py-1.5 bg-white/90 text-slate-900 text-xs font-extrabold rounded-lg shadow-sm">
                      Live Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Upload from device */}
              <div>
                <label className={labelClass}>Upload from Device</label>
                <label
                  className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-xs font-bold transition cursor-pointer ${
                    imageUploading
                      ? "border-slate-300 dark:border-slate-600 text-slate-400"
                      : "border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  }`}
                >
                  <Icon name={imageUploading ? "loader" : "upload"} className="text-base" />
                  <span>{imageUploading ? "Uploading..." : "Choose Image File"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={imageUploading} />
                </label>
              </div>

              {/* Or paste a URL */}
              <div>
                <label className={labelClass}>Image URL</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Paste an image URL (e.g. https://...)"
                  className={inputClass}
                />
              </div>
            </SectionCard>

            <SectionCard icon="category" title="Category">
              <div>
                <label className={labelClass}>Product Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  required
                  className={selectClass}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </SectionCard>
          </div>
        </div>
      </form>
    </Modal>
  );
};
