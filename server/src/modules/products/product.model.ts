import mongoose, { type Document, type Model } from "mongoose";
import { seedIfEmpty } from "../../utils/seedIfEmpty.js";

export interface IProduct extends Document {
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: "active" | "out_of_stock" | "inactive";
  rating: number;
  reviewsCount: number;
  arrival: boolean;
  isSale: boolean;
  images: string[];
  description: string;
  specs: Map<string, string>;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, default: "Lumen", index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "out_of_stock", "inactive"], default: "active" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    arrival: { type: Boolean, default: false },
    isSale: { type: Boolean, default: false },
    images: [{ type: String }],
    description: { type: String, default: "" },
    specs: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

productSchema.index({ price: 1, status: 1 });

export const ProductModel: Model<IProduct> = mongoose.model<IProduct>("Product", productSchema);

const SEED_PRODUCTS = [
  {
    name: "iPhone 16 Pro Max 256GB Titanium",
    category: "electronics",
    brand: "Apple",
    price: 1099.0,
    originalPrice: 1199.0,
    stock: 15,
    status: "active" as const,
    rating: 4.9,
    reviewsCount: 1420,
    arrival: true,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Forged in grade-5 titanium with a revolutionary micro-blasted finish.",
    specs: { Display: "6.9-inch Super Retina XDR OLED", Chipset: "Apple A18 Pro" },
  },
  {
    name: "Samsung Galaxy S24 Ultra 12GB Titanium Gray",
    category: "electronics",
    brand: "Samsung",
    price: 999.99,
    originalPrice: 1299.99,
    stock: 8,
    status: "active" as const,
    rating: 4.8,
    reviewsCount: 1200,
    arrival: false,
    isSale: true,
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80"],
    description: "Meet Galaxy S24 Ultra powered by Galaxy AI.",
    specs: { Display: "6.8-inch Dynamic AMOLED 2X", "S-Pen": "Embedded" },
  },
  {
    name: "Nike Jordan Brooklyn Fleece Men's Hoodie",
    category: "fashion",
    brand: "Nike",
    price: 45.0,
    originalPrice: 65.0,
    stock: 24,
    status: "active" as const,
    rating: 4.6,
    reviewsCount: 569,
    arrival: false,
    isSale: true,
    images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"],
    description: "Midweight brushed fleece hoodie with iconic Jumpman branding.",
    specs: { Material: "80% Cotton / 20% Polyester", Fit: "Standard" },
  },
  {
    name: "Diamond Stud Earrings in 14K White Gold",
    category: "luxury",
    brand: "Lumen Fine Jewelry",
    price: 299.0,
    originalPrice: 399.0,
    stock: 6,
    status: "active" as const,
    rating: 4.9,
    reviewsCount: 1100,
    arrival: true,
    isSale: false,
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"],
    description: "Elegant lab-grown diamond stud earrings in solid 14k white gold.",
    specs: { "Total Carat Weight": "1.00 ctw", Metal: "14K Solid White Gold" },
  },
  {
    name: "Premium ANC Wireless Headphones (Rose Pink)",
    category: "electronics",
    brand: "Sony",
    price: 189.99,
    originalPrice: 249.99,
    stock: 12,
    status: "active" as const,
    rating: 4.7,
    reviewsCount: 840,
    arrival: true,
    isSale: false,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
    description: "Hi-res wireless audio with dual noise canceling microphones.",
    specs: { Connectivity: "Bluetooth 5.3", "Battery Life": "40 hours" },
  },
  {
    name: "Designer Italian Leather Crossbody Bag",
    category: "luxury",
    brand: "Milano Leather",
    price: 420.0,
    originalPrice: 550.0,
    stock: 3,
    status: "active" as const,
    rating: 4.8,
    reviewsCount: 310,
    arrival: false,
    isSale: true,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"],
    description: "Handcrafted in Florence using full-grain pebbled calfskin.",
    specs: { Origin: "Made in Italy", Dimensions: '9.5W x 7H x 3.5D inches' },
  },
  {
    name: "Botanical Ceramic Vase & Dried Flower Set",
    category: "home",
    brand: "Kinto",
    price: 38.5,
    originalPrice: 50.0,
    stock: 0,
    status: "out_of_stock" as const,
    rating: 4.5,
    reviewsCount: 215,
    arrival: false,
    isSale: false,
    images: ["https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=800&q=80"],
    description: "Handcrafted matte ceramic vase with preserved eucalyptus.",
    specs: { Height: "8.5 inches", Finish: "Unglazed matte stoneware" },
  },
  {
    name: "Luminous Hydrating Glow Skincare Trio",
    category: "beauty",
    brand: "Lumen Beauty",
    price: 64.0,
    originalPrice: 85.0,
    stock: 18,
    status: "active" as const,
    rating: 4.9,
    reviewsCount: 650,
    arrival: true,
    isSale: false,
    images: ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"],
    description: "3-step dermatologist-tested skincare routine.",
    specs: { "Skin Type": "All skin types", Formula: "Cruelty-free, Vegan" },
  },
  {
    name: "Fresh Organic Farm-to-Table Produce Basket",
    category: "groceries",
    brand: "Green Harvest",
    price: 29.99,
    originalPrice: 35.0,
    stock: 10,
    status: "active" as const,
    rating: 4.7,
    reviewsCount: 430,
    arrival: false,
    isSale: false,
    images: ["https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"],
    description: "Curated weekly crate of pesticide-free local organic vegetables.",
    specs: { Weight: "10-12 lbs", Certification: "USDA Certified Organic" },
  },
  {
    name: "Beanless Bag Inflatable Velvet Lounge Chair",
    category: "home",
    brand: "Intex",
    price: 32.0,
    originalPrice: 48.0,
    stock: 4,
    status: "active" as const,
    rating: 4.3,
    reviewsCount: 100,
    arrival: false,
    isSale: true,
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"],
    description: "Inflatable lounge chair with soft corduroy velvet feel.",
    specs: { Dimensions: "42in x 41in x 27in", "Weight Capacity": "220 lbs" },
  },
];

export async function seedProducts(): Promise<void> {
  await seedIfEmpty(ProductModel, SEED_PRODUCTS, "products");
}
