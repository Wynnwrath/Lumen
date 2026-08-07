import React, { useState } from "react";
import { createProduct, updateProduct } from "../api/products";
import { uploadProductImage } from "../api/storage";
import type { Category, Product } from "../types";
import { useToast } from "../components/common/ToastProvider";
import { FALLBACK_PRODUCT_IMAGE } from "../constants";

export type ProductStatus = "active" | "inactive" | "out_of_stock";

// Add/edit product form state + save logic, so AdminProductsPage stays readable.
export const useProductForm = (
  categories: Category[],
  refreshProducts: () => Promise<void>
) => {
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("electronics");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formStatus, setFormStatus] = useState<ProductStatus>("active");
  const [formImage, setFormImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [formDescription, setFormDescription] = useState("");

  // Reset everything for a fresh "Add product" modal.
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory(categories[0]?.slug || "electronics");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStock("");
    setFormStatus("active");
    setFormImage(FALLBACK_PRODUCT_IMAGE);
    setFormDescription("");
    setShowModal(true);
  };

  // Pre-fill the form with the product being edited.
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormOriginalPrice((p.originalPrice || p.price).toString());
    setFormStock(p.stock.toString());
    setFormStatus(p.status || (p.stock > 0 ? "active" : "out_of_stock"));
    setFormImage(p.images[0] || "");
    setFormDescription(p.description || "");
    setShowModal(true);
  };

  // Upload a chosen image file to Supabase and use its URL.
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadProductImage(file);
      setFormImage(url);
    } catch (error) {
      showToast("Image upload failed. Please try again.", "error");
    } finally {
      setImageUploading(false);
    }
  };

  // Create or update, then refresh the list.
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(formPrice) || 0;
    const stockNum = Number(formStock) || 0;
    const payload = {
      name: formName,
      category: formCategory,
      price: priceNum,
      originalPrice: Number(formOriginalPrice) || priceNum,
      stock: stockNum,
      status: stockNum <= 0 && formStatus !== "inactive" ? "out_of_stock" : formStatus,
      images: [formImage || FALLBACK_PRODUCT_IMAGE],
      description: formDescription || "Product from Lumen catalog.",
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        showToast(`Updated product "${formName}"`, "success");
      } else {
        await createProduct(payload);
        showToast(`Created new product "${formName}"`, "success");
      }
      await refreshProducts();
    } catch (error) {
      showToast("Failed to save product", "error");
    }

    setShowModal(false);
  };

  return {
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
  };
};
