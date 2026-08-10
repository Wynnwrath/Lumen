import React, { useState } from "react";
import { createProduct, updateProduct } from "../api/products";
import { uploadProductImage } from "../api/storage";
import type { Category, Product, ProductStatus } from "../types";
import { useToast } from "../components/ui/ToastProvider";

// Max images a product can have in the form; the detail page gallery handles any count.
const MAX_IMAGES = 4;

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
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [formDescription, setFormDescription] = useState("");
  const [formIsSale, setFormIsSale] = useState(false);
  const [formArrival, setFormArrival] = useState(false);

  // Reset everything for a fresh "Add product" modal.
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory(categories[0]?.slug || "electronics");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStock("");
    setFormStatus("active");
    setFormIsSale(false);
    setFormArrival(false);
    setFormImages([]);
    setFormImageUrl("");
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
    setFormIsSale(p.isSale);
    setFormArrival(p.arrival);
    setFormImages(p.images?.slice(0, MAX_IMAGES) || []);
    setFormImageUrl("");
    setFormDescription(p.description || "");
    setShowModal(true);
  };

  // Upload a chosen image file to Supabase and append its URL.
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formImages.length >= MAX_IMAGES) {
      showToast(`Maximum of ${MAX_IMAGES} images per product`, "error");
      return;
    }
    setImageUploading(true);
    try {
      const url = await uploadProductImage(file);
      setFormImages((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, url]));
    } catch (error) {
      showToast("Image upload failed. Please try again.", "error");
    } finally {
      setImageUploading(false);
    }
  };

  // Add a pasted URL to the image list.
  const handleAddImageUrl = () => {
    const url = formImageUrl.trim();
    if (!url) return;
    if (formImages.length >= MAX_IMAGES) {
      showToast(`Maximum of ${MAX_IMAGES} images per product`, "error");
      return;
    }
    if (formImages.includes(url)) {
      showToast("That image URL is already added", "info");
      return;
    }
    setFormImages((prev) => [...prev, url]);
    setFormImageUrl("");
  };

  // Remove an image from the list.
  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
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
      isSale: formIsSale,
      arrival: formArrival,
      images: formImages,
      description: formDescription || "Product from Lumen catalog.",
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
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
    formImages,
    setFormImages,
    formImageUrl,
    setFormImageUrl,
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
    handleAddImageUrl,
    handleRemoveImage,
    handleSaveProduct,
  };
};
