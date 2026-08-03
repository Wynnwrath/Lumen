// Central Store & LocalStorage Data Layer for Lumen E-Commerce

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    name: "iPhone 16 Pro Max 256GB Titanium",
    category: "electronics",
    brand: "Apple",
    price: 1099.00,
    originalPrice: 1199.00,
    stock: 15,
    status: "active",
    rating: 4.9,
    reviewsCount: 1420,
    isNew: true,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Forged in grade-5 titanium with a revolutionary micro-blasted finish. iPhone 16 Pro Max features a strong, lightweight titanium design with the thinnest borders ever on an Apple product. Powered by the groundbreaking A18 Pro chip with 6-core GPU for console-level gaming.",
    specs: {
      "Display": "6.9-inch Super Retina XDR OLED, 120Hz ProMotion",
      "Chipset": "Apple A18 Pro (3nm process)",
      "Camera": "48MP Main + 48MP Ultra Wide + 12MP 5x Telephoto",
      "Battery": "Up to 33 hours video playback",
      "Material": "Grade 5 Titanium frame, Ceramic Shield front"
    }
  },
  {
    id: "p2",
    name: "Samsung Galaxy S24 Ultra 12GB Titanium Gray",
    category: "electronics",
    brand: "Samsung",
    price: 999.99,
    originalPrice: 1299.99,
    stock: 8,
    status: "active",
    rating: 4.8,
    reviewsCount: 1200,
    isNew: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. It’s an absolute marvel of design powered by Galaxy AI.",
    specs: {
      "Display": "6.8-inch Dynamic AMOLED 2X, 120Hz",
      "Processor": "Snapdragon 8 Gen 3 for Galaxy",
      "Camera": "200MP Quad Telephoto System",
      "S-Pen": "Embedded S-Pen with Air Actions"
    }
  },
  {
    id: "p3",
    name: "Nike Jordan Brooklyn Fleece Men's Hoodie",
    category: "fashion",
    brand: "Nike",
    price: 45.00,
    originalPrice: 65.00,
    stock: 24,
    status: "active",
    rating: 4.6,
    reviewsCount: 569,
    isNew: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Smooth on the outside and soft on the inside, this midweight brushed fleece hoodie brings comfortable casual style to your wardrobe with iconic Jumpman branding.",
    specs: {
      "Material": "80% Cotton / 20% Polyester",
      "Fit": "Standard fit for a relaxed, easy feel",
      "Pockets": "Front kangaroo pocket",
      "Care": "Machine wash"
    }
  },
  {
    id: "p4",
    name: "Beanless Bag Inflatable Velvet Lounge Chair",
    category: "home",
    brand: "Intex",
    price: 32.00,
    originalPrice: 48.00,
    stock: 4,
    status: "active",
    rating: 4.3,
    reviewsCount: 100,
    isNew: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Designed for ultimate relaxation, this inflatable lounge chair features a soft corduroy velvet feel and chic contoured design perfect for living rooms or bedrooms.",
    specs: {
      "Dimensions": "42in x 41in x 27in",
      "Weight Capacity": "220 lbs",
      "Surface": "Waterproof flocked top and sides"
    }
  },
  {
    id: "p5",
    name: "Diamond Stud Earrings in 14K White Gold",
    category: "luxury",
    brand: "Lumen Fine Jewelry",
    price: 299.00,
    originalPrice: 399.00,
    stock: 6,
    status: "active",
    rating: 4.9,
    reviewsCount: 1100,
    isNew: true,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Elegant round-cut lab-grown diamond stud earrings set in solid 14k white gold four-prong baskets with secure friction backs.",
    specs: {
      "Total Carat Weight": "1.00 ctw",
      "Metal": "14K Solid White Gold",
      "Clarity": "VS1 - VS2",
      "Color Grade": "F - G (Colorless)"
    }
  },
  {
    id: "p6",
    name: "Premium ANC Wireless Headphones (Rose Pink)",
    category: "electronics",
    brand: "Sony",
    price: 189.99,
    originalPrice: 249.99,
    stock: 12,
    status: "active",
    rating: 4.7,
    reviewsCount: 840,
    isNew: true,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
    ],
    description: "High-resolution wireless audio featuring dual noise canceling microphones, custom 40mm drivers, and up to 40 hours of continuous wireless playback.",
    specs: {
      "Connectivity": "Bluetooth 5.3 + 3.5mm Aux",
      "Battery Life": "40 hours ANC ON / 50 hours ANC OFF",
      "Charging": "USB-C Quick Charge (10 mins = 5 hrs)"
    }
  },
  {
    id: "p7",
    name: "Designer Italian Leather Crossbody Bag",
    category: "luxury",
    brand: "Milano Leather",
    price: 420.00,
    originalPrice: 550.00,
    stock: 3,
    status: "active",
    rating: 4.8,
    reviewsCount: 310,
    isNew: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Handcrafted in Florence using full-grain pebbled calfskin. Features custom pale gold hardware, microfiber lining, and adjustable crossbody strap.",
    specs: {
      "Origin": "Made in Italy",
      "Dimensions": "9.5W x 7H x 3.5D inches",
      "Hardware": "18K Gold Plated Brass"
    }
  },
  {
    id: "p8",
    name: "Botanical Ceramic Vase & Dried Flower Set",
    category: "home",
    brand: "Kinto",
    price: 38.50,
    originalPrice: 50.00,
    stock: 0,
    status: "out_of_stock",
    rating: 4.5,
    reviewsCount: 215,
    isNew: false,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Handcrafted matte ceramic vase complete with a preserved natural bundle of eucalyptus and baby's breath. Brings organic warmth to modern desks and tables.",
    specs: {
      "Height": "8.5 inches",
      "Finish": "Unglazed matte stoneware",
      "Contents": "Vase + 15 preserved stems"
    }
  },
  {
    id: "p9",
    name: "Luminous Hydrating Glow Skincare Trio",
    category: "beauty",
    brand: "Lumen Beauty",
    price: 64.00,
    originalPrice: 85.00,
    stock: 18,
    status: "active",
    rating: 4.9,
    reviewsCount: 650,
    isNew: true,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    ],
    description: "A 3-step dermatologist-tested skincare routine formulated with multi-weight hyaluronic acid, squalane, and vitamin C to hydrate, plump, and brighten skin.",
    specs: {
      "Set Includes": "Cleanser (150ml), Serum (30ml), Cream (50ml)",
      "Skin Type": "Suitable for all skin types",
      "Formula": "Cruelty-free, Vegan, Paraben-free"
    }
  },
  {
    id: "p10",
    name: "Fresh Organic Farm-to-Table Produce Basket",
    category: "groceries",
    brand: "Green Harvest",
    price: 29.99,
    originalPrice: 35.00,
    stock: 10,
    status: "active",
    rating: 4.7,
    reviewsCount: 430,
    isNew: false,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Curated weekly crate of pesticide-free local organic vegetables including crisp heirloom tomatoes, bell peppers, fresh kale, and avocados.",
    specs: {
      "Weight": "Approx. 10-12 lbs",
      "Certification": "USDA Certified Organic",
      "Origin": "Local family farms"
    }
  },
  {
    id: "p11",
    name: "Wireless Earbuds",
    category: "electronics",
    brand: "Apple",
    price: 89.00,
    originalPrice: 129.00,
    stock: 20,
    status: "active",
    rating: 4.9,
    reviewsCount: 121,
    isNew: true,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Premium wireless bluetooth earbuds with deep bass response, active noise cancellation, and all-day battery life with charging case.",
    specs: {
      "Battery Life": "6 hours + 24 hours with case",
      "Wireless": "Bluetooth 5.3",
      "Water Resistance": "IPX4 Sweatproof"
    }
  },
  {
    id: "p12",
    name: "Wireless Earbuds Pro",
    category: "electronics",
    brand: "Apple",
    price: 599.00,
    originalPrice: 699.00,
    stock: 10,
    status: "active",
    rating: 5.0,
    reviewsCount: 121,
    isNew: true,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Audiophile-grade studio wireless earbuds featuring custom dual-driver architecture, adaptive transparency mode, and spatial audio with dynamic head tracking.",
    specs: {
      "Noise Cancellation": "Next-Gen Active Noise Cancellation",
      "Spatial Audio": "Personalized Spatial Audio with Head Tracking",
      "Case": "MagSafe Wireless Charging Case with Speaker"
    }
  },
  {
    id: "p13",
    name: "Bose Bt Earphones",
    category: "electronics",
    brand: "Bose",
    price: 89.00,
    originalPrice: 119.00,
    stock: 15,
    status: "active",
    rating: 4.8,
    reviewsCount: 121,
    isNew: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Iconic Bose acoustic tuning in a compact wireless earphone design with ultra-comfortable StayHear Max tips and crystal clear call quality.",
    specs: {
      "Brand": "Bose",
      "Playtime": "8 hours per charge",
      "Noise Isolation": "Passive acoustic seal"
    }
  },
  {
    id: "p14",
    name: "Beats solo3",
    category: "electronics",
    brand: "Beats",
    price: 199.95,
    originalPrice: 249.95,
    stock: 12,
    status: "active",
    rating: 4.7,
    reviewsCount: 121,
    isNew: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Iconic Beats solo3 wireless headphones with Apple W1 chip, 40 hours of battery life, and Fast Fuel 5-minute charge for 3 hours of playback.",
    specs: {
      "Chip": "Apple W1 Headphone Chip",
      "Battery": "Up to 40 hours",
      "Controls": "On-ear call, track, and volume controls"
    }
  },
  {
    id: "p15",
    name: "Tao Tronics Earbuds",
    category: "electronics",
    brand: "TaoTronics",
    price: 59.00,
    originalPrice: 79.00,
    stock: 18,
    status: "active",
    rating: 4.6,
    reviewsCount: 121,
    isNew: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Compact wireless earbuds with MEMS microphone noise-reduction for clear voice calls and ergonomic fit for daily workouts.",
    specs: {
      "Bluetooth": "Bluetooth 5.0",
      "Playtime": "7 hours + 28 hours with case",
      "Charging": "USB-C Fast Charging"
    }
  }
];

const INITIAL_CATEGORIES = [
  { id: "c1", slug: "electronics", name: "Electronics", icon: "devices", description: "Smartphones, laptops, audio gear, and cutting-edge gadgetry." },
  { id: "c2", slug: "fashion", name: "Fashion", icon: "checkroom", description: "Apparel, footwear, and designer streetwear for men and women." },
  { id: "c3", slug: "home", name: "Home & Living", icon: "chair", description: "Modern furniture, aesthetic decor, kitchenware, and lighting." },
  { id: "c4", slug: "beauty", name: "Beauty & Skincare", icon: "spa", description: "Premium cosmetics, skincare serums, fragrances, and wellness." },
  { id: "c5", slug: "groceries", name: "Groceries", icon: "shopping_basket", description: "Fresh produce, artisanal beverages, and gourmet pantry essentials." },
  { id: "c6", slug: "luxury", name: "Luxury Items", icon: "diamond", description: "High-end jewelry, fine timepieces, Italian leather, and collectibles." }
];

class Store {
  constructor() {
    this.init();
  }

  init() {
    // Always refresh catalog to include latest sample products if needed
    const existing = localStorage.getItem("lumen_products");
    if (!existing || JSON.parse(existing).length < INITIAL_PRODUCTS.length) {
      localStorage.setItem("lumen_products", JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem("lumen_categories")) {
      localStorage.setItem("lumen_categories", JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem("lumen_cart")) {
      localStorage.setItem("lumen_cart", JSON.stringify([]));
    }
    if (!localStorage.getItem("lumen_wishlist")) {
      localStorage.setItem("lumen_wishlist", JSON.stringify([]));
    }
    if (!localStorage.getItem("lumen_orders")) {
      localStorage.setItem("lumen_orders", JSON.stringify([]));
    }
  }

  // Product methods
  getProducts(forCustomer = false) {
    const products = JSON.parse(localStorage.getItem("lumen_products")) || INITIAL_PRODUCTS;
    if (forCustomer) {
      return products.filter((p) => p.status !== "inactive");
    }
    return products;
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find((p) => p.id === id) || products[0];
  }

  saveProducts(products) {
    localStorage.setItem("lumen_products", JSON.stringify(products));
  }

  addProduct(productData) {
    const products = this.getProducts();
    const newId = "p" + Date.now();
    const stockVal = Number(productData.stock) || 0;
    
    let calcStatus = productData.status || (stockVal > 0 ? "active" : "out_of_stock");
    if (stockVal <= 0 && calcStatus !== "inactive") {
      calcStatus = "out_of_stock";
    }

    const newProduct = {
      id: newId,
      name: productData.name || "Untitled Product",
      category: productData.category || "electronics",
      brand: productData.brand || "Lumen",
      price: Number(productData.price) || 0,
      originalPrice: Number(productData.originalPrice) || Number(productData.price) || 0,
      stock: stockVal,
      status: calcStatus,
      rating: 5.0,
      reviewsCount: 1,
      isNew: true,
      isSale: false,
      images: [
        productData.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
      ],
      description: productData.description || "Premium product in the Lumen e-commerce store.",
      specs: productData.specs || { "Brand": productData.brand || "Lumen" }
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return { success: true, product: newProduct };
  }

  updateProduct(id, productData) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return { success: false, message: "Product not found." };

    const newStock = productData.stock !== undefined ? Number(productData.stock) : products[index].stock;
    let newStatus = productData.status !== undefined ? productData.status : products[index].status;
    if (newStock <= 0 && newStatus !== "inactive") {
      newStatus = "out_of_stock";
    }

    const updated = {
      ...products[index],
      name: productData.name !== undefined ? productData.name : products[index].name,
      category: productData.category !== undefined ? productData.category : products[index].category,
      brand: productData.brand !== undefined ? productData.brand : products[index].brand,
      price: productData.price !== undefined ? Number(productData.price) : products[index].price,
      originalPrice: productData.originalPrice !== undefined ? Number(productData.originalPrice) : products[index].originalPrice,
      stock: newStock,
      status: newStatus,
      description: productData.description !== undefined ? productData.description : products[index].description
    };

    if (productData.image) {
      updated.images = [productData.image];
    }

    products[index] = updated;

    this.saveProducts(products);
    return { success: true, product: updated };
  }

  deleteProduct(id) {
    let products = this.getProducts();
    const initialLen = products.length;
    products = products.filter((p) => p.id !== id);
    if (products.length === initialLen) return { success: false, message: "Product not found." };
    this.saveProducts(products);
    return { success: true };
  }

  // Category Methods
  getCategories() {
    return JSON.parse(localStorage.getItem("lumen_categories")) || INITIAL_CATEGORIES;
  }

  getCategoryById(id) {
    const categories = this.getCategories();
    return categories.find((c) => c.id === id || c.slug === id);
  }

  saveCategories(categories) {
    localStorage.setItem("lumen_categories", JSON.stringify(categories));
  }

  addCategory(categoryData) {
    const categories = this.getCategories();
    const newId = "c" + Date.now();
    const slug = (categoryData.slug || categoryData.name || "category").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCategory = {
      id: newId,
      slug: slug,
      name: categoryData.name || "New Category",
      icon: categoryData.icon || "category",
      description: categoryData.description || "Category description in the Lumen e-commerce store."
    };
    categories.unshift(newCategory);
    this.saveCategories(categories);
    return { success: true, category: newCategory };
  }

  updateCategory(id, categoryData) {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id || c.slug === id);
    if (index === -1) return { success: false, message: "Category not found." };

    const updated = {
      ...categories[index],
      name: categoryData.name !== undefined ? categoryData.name : categories[index].name,
      slug: categoryData.slug !== undefined ? (categoryData.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-")) : categories[index].slug,
      icon: categoryData.icon !== undefined ? categoryData.icon : categories[index].icon,
      description: categoryData.description !== undefined ? categoryData.description : categories[index].description
    };

    categories[index] = updated;
    this.saveCategories(categories);
    return { success: true, category: updated };
  }

  deleteCategory(id) {
    const categories = this.getCategories();
    const targetCategory = categories.find((c) => c.id === id || c.slug === id);
    if (!targetCategory) return { success: false, message: "Category not found." };

    // PDF Requirement Check: Prevent deletion if category is currently assigned to a product
    const products = this.getProducts();
    const assignedProducts = products.filter(
      (p) => p.category === targetCategory.slug || p.category === targetCategory.id || (p.category && p.category.toLowerCase() === targetCategory.name.toLowerCase())
    );

    if (assignedProducts.length > 0) {
      return {
        success: false,
        isAssigned: true,
        assignedCount: assignedProducts.length,
        categoryName: targetCategory.name,
        message: `Cannot delete category "${targetCategory.name}" because it is currently assigned to ${assignedProducts.length} product(s). Please reassign those products before deleting this category.`
      };
    }

    const updatedCategories = categories.filter((c) => c.id !== targetCategory.id && c.slug !== targetCategory.slug);
    this.saveCategories(updatedCategories);
    return { success: true };
  }


  // Cart methods
  getCart() {
    return JSON.parse(localStorage.getItem("lumen_cart")) || [];
  }

  saveCart(cart) {
    localStorage.setItem("lumen_cart", JSON.stringify(cart));
  }

  addToCart(productId, qty = 1) {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) return { success: false, reason: "out_of_stock" };

    let cart = this.getCart();
    const existing = cart.find((item) => item.id === productId);

    const currentQtyInCart = existing ? existing.quantity : 0;
    if (currentQtyInCart + qty > product.stock) {
      return { success: false, reason: "exceeds_stock", maxStock: product.stock };
    }

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...product, quantity: qty });
    }

    this.saveCart(cart);
    return { success: true, item: product, quantity: existing ? existing.quantity : qty };
  }

  updateCartQuantity(productId, delta) {
    let cart = this.getCart();
    const item = cart.find((c) => c.id === productId);
    if (!item) return;

    const product = this.getProductById(productId);
    if (delta > 0 && item.quantity + delta > product.stock) {
      return { success: false, reason: "exceeds_stock", maxStock: product.stock };
    }

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((c) => c.id !== productId);
    }
    this.saveCart(cart);
    return { success: true };
  }

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter((c) => c.id !== productId);
    this.saveCart(cart);
  }

  clearCart() {
    this.saveCart([]);
  }

  // Wishlist methods
  getWishlist() {
    return JSON.parse(localStorage.getItem("lumen_wishlist")) || [];
  }

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);
    let added = false;
    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(productId);
      added = true;
    }
    localStorage.setItem("lumen_wishlist", JSON.stringify(wishlist));
    return { added, count: wishlist.length };
  }

  // Orders methods
  getOrders() {
    const data = localStorage.getItem("lumen_orders");
    if (!data) {
      const defaultOrders = [
        {
          orderNumber: "LMN-892401",
          orderDate: new Date(Date.now() - 3600000 * 2).toISOString(),
          customerName: "Alex Morgan",
          customerEmail: "alex.morgan@lumen.com",
          contactNumber: "+1 (555) 234-5678",
          deliveryAddress: "742 Evergreen Terrace, Springfield, IL 62704",
          paymentMethod: "E-Wallet",
          orderStatus: "Pending",
          totalAmount: 1199.00,
          items: [{ id: "p1", name: "iPhone 16 Pro Max", price: 1099.00, quantity: 1 }],
          orderNotes: "Please deliver before 5 PM."
        },
        {
          orderNumber: "LMN-741029",
          orderDate: new Date(Date.now() - 3600000 * 14).toISOString(),
          customerName: "Sarah Jenkins",
          customerEmail: "sarah.j@example.com",
          contactNumber: "+1 (555) 987-6543",
          deliveryAddress: "1042 Market St, San Francisco, CA 94103",
          paymentMethod: "Bank Transfer",
          orderStatus: "Confirmed",
          totalAmount: 399.00,
          items: [{ id: "p3", name: "Sony WH-1000XM5 Headphones", price: 399.00, quantity: 1 }],
          orderNotes: "Leave package at front desk."
        },
        {
          orderNumber: "LMN-630182",
          orderDate: new Date(Date.now() - 3600000 * 30).toISOString(),
          customerName: "David Chen",
          customerEmail: "d.chen@techcorp.io",
          contactNumber: "+1 (555) 456-7890",
          deliveryAddress: "450 Mission St, Suite 1200, San Francisco, CA 94105",
          paymentMethod: "Cash on Delivery",
          orderStatus: "Preparing",
          totalAmount: 2499.00,
          items: [{ id: "p2", name: "MacBook Pro 16\" M3", price: 2499.00, quantity: 1 }],
          orderNotes: ""
        },
        {
          orderNumber: "LMN-512940",
          orderDate: new Date(Date.now() - 3600000 * 54).toISOString(),
          customerName: "Elena Rostova",
          customerEmail: "elena.r@luxury.com",
          contactNumber: "+1 (555) 321-6549",
          deliveryAddress: "880 5th Ave, Apt 14B, New York, NY 10021",
          paymentMethod: "E-Wallet",
          orderStatus: "Shipped",
          totalAmount: 1850.00,
          items: [{ id: "p5", name: "Precision Titanium Watch", price: 1850.00, quantity: 1 }],
          orderNotes: "Signature required."
        },
        {
          orderNumber: "LMN-410982",
          orderDate: new Date(Date.now() - 3600000 * 80).toISOString(),
          customerName: "Marcus Vance",
          customerEmail: "marcus.vance@gmail.com",
          contactNumber: "+1 (555) 789-0123",
          deliveryAddress: "1200 Peachtree St, Atlanta, GA 30309",
          paymentMethod: "Bank Transfer",
          orderStatus: "Completed",
          totalAmount: 750.00,
          items: [{ id: "p6", name: "Ultra-Wide Gaming Monitor 34\"", price: 750.00, quantity: 1 }],
          orderNotes: "Call upon arrival."
        }
      ];
      localStorage.setItem("lumen_orders", JSON.stringify(defaultOrders));
      return defaultOrders;
    }
    return JSON.parse(data);
  }

  updateOrderStatus(orderNumber, newStatus) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return { success: false, message: "Order not found." };
    order.orderStatus = newStatus;
    localStorage.setItem("lumen_orders", JSON.stringify(orders));
    return { success: true, order };
  }

  getDashboardStats() {
    const products = this.getProducts();
    const orders = this.getOrders();
    const users = this.getUsers();

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === "Pending").length;
    const completedOrders = orders.filter((o) => o.orderStatus === "Completed").length;
    const totalCustomers = users.length;

    const totalSales = orders.reduce((sum, o) => {
      if (o.orderStatus !== "Cancelled") {
        return sum + (Number(o.totalAmount) || 0);
      }
      return sum;
    }, 0);

    const lowStockItems = products.filter((p) => p.stock !== undefined && p.stock < 5);

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalSales,
      lowStockItems
    };
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      orderNumber: "LMN-" + Math.floor(100000 + Math.random() * 900000),
      orderDate: new Date().toISOString(),
      orderStatus: "Pending",
      items: this.getCart(),
      ...orderData
    };
    orders.unshift(newOrder);
    localStorage.setItem("lumen_orders", JSON.stringify(orders));

    // Deduct stock
    const products = this.getProducts();
    newOrder.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.id);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        if (p.stock === 0) p.status = "out_of_stock";
      }
    });
    this.clearCart();

    return newOrder;
  }

  // Seller & Admin Management
  getSellers() {
    const data = localStorage.getItem("lumen_sellers");
    if (!data) {
      const defaultSellers = [
        {
          id: "s1",
          storeName: "Lumen Official Store",
          email: "admin@lumen.com",
          password: "password123",
          category: "electronics",
          rating: 4.9,
          role: "admin",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem("lumen_sellers", JSON.stringify(defaultSellers));
      return defaultSellers;
    }
    return JSON.parse(data);
  }

  saveSellers(sellers) {
    localStorage.setItem("lumen_sellers", JSON.stringify(sellers));
  }

  getSellerSession() {
    const data = localStorage.getItem("lumen_seller_session");
    return data ? JSON.parse(data) : null;
  }

  loginSeller(email, password) {
    const sellers = this.getSellers();
    const seller = sellers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase().trim() && s.password === password
    );

    if (!seller) {
      return { success: false, message: "Invalid email address or password." };
    }

    const session = {
      id: seller.id,
      storeName: seller.storeName,
      email: seller.email,
      role: seller.role || "seller",
      category: seller.category || "general",
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem("lumen_seller_session", JSON.stringify(session));
    return { success: true, session };
  }

  registerSeller(sellerData) {
    const sellers = this.getSellers();
    const emailExists = sellers.some(
      (s) => s.email.toLowerCase() === sellerData.email.toLowerCase().trim()
    );

    if (emailExists) {
      return { success: false, message: "An account with this email address already exists." };
    }

    const newSeller = {
      id: "seller_" + Date.now(),
      storeName: sellerData.storeName.trim(),
      email: sellerData.email.toLowerCase().trim(),
      password: sellerData.password,
      category: sellerData.category || "electronics",
      role: "seller",
      rating: 5.0,
      createdAt: new Date().toISOString()
    };

    sellers.push(newSeller);
    this.saveSellers(sellers);

    // Automatically log in newly registered seller
    const session = {
      id: newSeller.id,
      storeName: newSeller.storeName,
      email: newSeller.email,
      role: newSeller.role,
      category: newSeller.category,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem("lumen_seller_session", JSON.stringify(session));
    return { success: true, session };
  }

  logoutSeller() {
    localStorage.removeItem("lumen_seller_session");
  }

  // Customer / Buyer Management
  getUsers() {
    const data = localStorage.getItem("lumen_users");
    if (!data) {
      const defaultUsers = [
        {
          id: "u1",
          name: "Alex Morgan",
          email: "alex.morgan@lumen.com",
          password: "password123",
          phone: "+1 (555) 234-5678",
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem("lumen_users", JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(data);
  }

  saveUsers(users) {
    localStorage.setItem("lumen_users", JSON.stringify(users));
  }

  getUserSession() {
    const data = localStorage.getItem("lumen_user_session");
    if (!data) {
      // Default to initial demo user if not logged out explicitly
      const isExplicitLoggedOut = localStorage.getItem("lumen_user_explicit_logout");
      if (!isExplicitLoggedOut) {
        const defaultSession = {
          id: "u1",
          name: "Alex Morgan",
          email: "alex.morgan@lumen.com",
          phone: "+1 (555) 234-5678",
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem("lumen_user_session", JSON.stringify(defaultSession));
        return defaultSession;
      }
      return null;
    }
    return JSON.parse(data);
  }

  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );

    if (!user) {
      return { success: false, message: "Invalid customer email address or password." };
    }

    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      loggedInAt: new Date().toISOString()
    };

    localStorage.removeItem("lumen_user_explicit_logout");
    localStorage.setItem("lumen_user_session", JSON.stringify(session));
    return { success: true, session };
  }

  registerUser(userData) {
    const users = this.getUsers();
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase().trim()
    );

    if (emailExists) {
      return { success: false, message: "A customer account with this email already exists." };
    }

    const newUser = {
      id: "user_" + Date.now(),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      phone: userData.phone || "",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    const session = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      loggedInAt: new Date().toISOString()
    };

    localStorage.removeItem("lumen_user_explicit_logout");
    localStorage.setItem("lumen_user_session", JSON.stringify(session));
    return { success: true, session };
  }

  logoutUser() {
    localStorage.removeItem("lumen_user_session");
    localStorage.setItem("lumen_user_explicit_logout", "true");
  }
}

window.lumenStore = new Store();

// Global User Menu Dropdown Handler
function setupUserMenu() {
  const btn = document.getElementById("user-menu-btn");
  const dropdown = document.getElementById("user-menu-dropdown");
  if (!btn || !dropdown) return;

  const session = window.lumenStore.getUserSession();
  const initials = session ? session.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  if (session) {
    dropdown.innerHTML = `
      <div class="px-3 py-2.5 bg-surface dark:bg-slate-700/60 rounded-xl border border-outline-variant/20 mb-1">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-xs shadow-xs">
            ${initials}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-extrabold text-on-surface dark:text-white truncate">${session.name}</p>
            <p class="text-[10px] text-outline truncate">${session.email}</p>
          </div>
        </div>
      </div>
      <a href="checkout.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container dark:hover:bg-slate-700/70 rounded-xl transition">
        <span class="material-symbols-outlined text-base text-secondary">person</span>
        <span>My Account & Orders</span>
      </a>
      <a href="admin-login.html" class="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container dark:hover:bg-slate-700/70 rounded-xl transition">
        <span class="material-symbols-outlined text-base text-secondary">storefront</span>
        <span>Seller Hub / Admin</span>
      </a>
      <button id="user-menu-logout-btn" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition text-left">
        <span class="material-symbols-outlined text-base">logout</span>
        <span>Sign Out</span>
      </button>
    `;
  } else {
    dropdown.innerHTML = `
      <div class="p-3 text-center space-y-2">
        <p class="text-xs font-bold text-on-surface dark:text-white">Welcome to Lumen</p>
        <p class="text-[11px] text-outline">Sign in to track orders and save your favorite items.</p>
        <a href="login.html" class="block w-full py-2 bg-secondary hover:bg-secondary-container text-white font-bold text-xs rounded-xl text-center shadow-xs transition">
          Sign In / Register
        </a>
      </div>
      <div class="pt-2 border-t border-outline-variant/20">
        <a href="admin-login.html" class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-outline hover:text-secondary transition">
          <span class="material-symbols-outlined text-base">storefront</span>
          <span>Seller Hub Portal</span>
        </a>
      </div>
    `;
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });

  const logoutBtn = document.getElementById("user-menu-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dropdown.classList.add("hidden");
      window.lumenStore.logoutUser();
      setupUserMenu();
      if (typeof showToast === "function") {
        showToast("Signed out successfully!", "info");
      } else {
        alert("Signed out successfully!");
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupUserMenu);
} else {
  setupUserMenu();
}
