import type { Product, Category, Order, CustomerData } from "../types";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_CUSTOMERS } from "./seedData";

class DataService {
  private init() {
    if (!localStorage.getItem("lumen_products_v2")) {
      localStorage.setItem("lumen_products_v2", JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem("lumen_categories_v2")) {
      localStorage.setItem("lumen_categories_v2", JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem("lumen_orders_v2")) {
      localStorage.setItem("lumen_orders_v2", JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem("lumen_customers_v2")) {
      localStorage.setItem("lumen_customers_v2", JSON.stringify(INITIAL_CUSTOMERS));
    }
  }

  constructor() {
    this.init();
  }

  // Products
  getProducts(): Product[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem("lumen_products_v2") || "[]");
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p._id === id);
  }

  addProduct(productData: Partial<Product>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      _id: "p" + Date.now(),
      name: productData.name || "Untitled Product",
      category: productData.category || "electronics",
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice) || Number(productData.price) || 0,
      stock: Number(productData.stock) || 0,
      status: Number(productData.stock) > 0 ? "active" : "out_of_stock",
      rating: 5.0,
      reviewsCount: 1,
      arrival: true,
      isSale: false,
      images: productData.images?.length
        ? productData.images
        : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"],
      description: productData.description || "Premium product in Lumen marketplace.",
      specs: productData.specs || {}
    };
    products.unshift(newProduct);
    localStorage.setItem("lumen_products_v2", JSON.stringify(products));
    return newProduct;
  }

  updateProduct(id: string, productData: Partial<Product>): Product | undefined {
    const products = this.getProducts();
    const index = products.findIndex((p) => p._id === id);
    if (index === -1) return undefined;
    const updated = { ...products[index], ...productData };
    if (updated.stock <= 0 && updated.status !== "inactive") {
      updated.status = "out_of_stock";
    }
    products[index] = updated;
    localStorage.setItem("lumen_products_v2", JSON.stringify(products));
    return updated;
  }

  deleteProduct(id: string): boolean {
    let products = this.getProducts();
    const initialLen = products.length;
    products = products.filter((p) => p._id !== id);
    if (products.length === initialLen) return false;
    localStorage.setItem("lumen_products_v2", JSON.stringify(products));
    return true;
  }

  // Categories
  getCategories(): Category[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem("lumen_categories_v2") || "[]");
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  addCategory(categoryData: Partial<Category>): Category {
    const categories = this.getCategories();
    const slug = (categoryData.slug || categoryData.name || "category").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCategory: Category = {
      _id: "c" + Date.now(),
      slug,
      name: categoryData.name || "New Category",
      icon: categoryData.icon || "category",
      description: categoryData.description || "Category description"
    };
    categories.unshift(newCategory);
    localStorage.setItem("lumen_categories_v2", JSON.stringify(categories));
    return newCategory;
  }

  updateCategory(id: string, categoryData: Partial<Category>): Category | undefined {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c._id === id || c.slug === id);
    if (index === -1) return undefined;
    const updated = { ...categories[index], ...categoryData };
    categories[index] = updated;
    localStorage.setItem("lumen_categories_v2", JSON.stringify(categories));
    return updated;
  }

  deleteCategory(id: string): { success: boolean; isAssigned?: boolean; message?: string } {
    const categories = this.getCategories();
    const target = categories.find((c) => c._id === id || c.slug === id);
    if (!target) return { success: false, message: "Category not found." };

    // Check if assigned to any product
    const products = this.getProducts();
    const assigned = products.filter(
      (p) => p.category === target.slug || p.category === target._id || p.category.toLowerCase() === target.name.toLowerCase()
    );

    if (assigned.length > 0) {
      return {
        success: false,
        isAssigned: true,
        message: `Cannot delete category "${target.name}" because it is currently assigned to ${assigned.length} product(s). Please reassign those products first.`
      };
    }

    const filtered = categories.filter((c) => c._id !== target._id && c.slug !== target.slug);
    localStorage.setItem("lumen_categories_v2", JSON.stringify(filtered));
    return { success: true };
  }

  // Orders
  getOrders(): Order[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem("lumen_orders_v2") || "[]");
    } catch {
      return INITIAL_ORDERS;
    }
  }

  addOrder(orderData: Partial<Order>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      _id: "ord_" + Date.now(),
      orderNumber: "017" + Math.floor(10000000 + Math.random() * 90000000),
      customer: orderData.customer || { _id: "cust_guest", name: "Guest Customer", email: "guest@example.com" },
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      shipping: orderData.shipping || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || "Credit Card",
      status: "Pending",
      address: orderData.address || "123 Main St",
      couponUsed: orderData.couponUsed,
      orderNotes: orderData.orderNotes,
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    localStorage.setItem("lumen_orders_v2", JSON.stringify(orders));
    return newOrder;
  }

  updateOrderStatus(orderIdOrNumber: string, status: string): Order | undefined {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o._id === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
    if (index === -1) return undefined;
    orders[index].status = status;
    localStorage.setItem("lumen_orders_v2", JSON.stringify(orders));
    return orders[index];
  }

  // Customers
  getCustomers(): CustomerData[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem("lumen_customers_v2") || "[]");
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }
}

export const dataService = new DataService();
