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
  getProducts() {
    return JSON.parse(localStorage.getItem("lumen_products")) || INITIAL_PRODUCTS;
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find((p) => p.id === id) || products[0];
  }

  saveProducts(products) {
    localStorage.setItem("lumen_products", JSON.stringify(products));
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
    return JSON.parse(localStorage.getItem("lumen_orders")) || [];
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
    this.saveProducts(products);
    this.clearCart();

    return newOrder;
  }
}

window.lumenStore = new Store();
