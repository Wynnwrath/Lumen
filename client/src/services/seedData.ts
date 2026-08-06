import type { Product, Category, Order, CustomerData } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    _id: "p1",
    name: "iPhone 16 Pro Max 256GB Titanium",
    category: "electronics",
    brand: "Apple",
    price: 1099.00,
    originalPrice: 1199.00,
    stock: 15,
    status: "active",
    rating: 4.9,
    reviewsCount: 1420,
    arrival: true,
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
    _id: "p2",
    name: "Samsung Galaxy S24 Ultra 12GB Titanium Gray",
    category: "electronics",
    brand: "Samsung",
    price: 999.99,
    originalPrice: 1299.99,
    stock: 8,
    status: "active",
    rating: 4.8,
    reviewsCount: 1200,
    arrival: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Powered by Galaxy AI.",
    specs: {
      "Display": "6.8-inch Dynamic AMOLED 2X, 120Hz",
      "Processor": "Snapdragon 8 Gen 3 for Galaxy",
      "Camera": "200MP Quad Telephoto System",
      "S-Pen": "Embedded S-Pen with Air Actions"
    }
  },
  {
    _id: "p3",
    name: "Nike Jordan Brooklyn Fleece Men's Hoodie",
    category: "fashion",
    brand: "Nike",
    price: 45.00,
    originalPrice: 65.00,
    stock: 24,
    status: "active",
    rating: 4.6,
    reviewsCount: 569,
    arrival: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Smooth on the outside and soft on the inside, this midweight brushed fleece hoodie brings comfortable casual style to your wardrobe with iconic Jumpman branding.",
    specs: {
      "Material": "80% Cotton / 20% Polyester",
      "Fit": "Standard fit for a relaxed feel",
      "Care": "Machine wash"
    }
  },
  {
    _id: "p4",
    name: "Beanless Bag Inflatable Velvet Lounge Chair",
    category: "home",
    brand: "Intex",
    price: 32.00,
    originalPrice: 48.00,
    stock: 4,
    status: "active",
    rating: 4.3,
    reviewsCount: 100,
    arrival: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Designed for ultimate relaxation, this inflatable lounge chair features a soft corduroy velvet feel and chic contoured design.",
    specs: {
      "Dimensions": "42in x 41in x 27in",
      "Weight Capacity": "220 lbs"
    }
  },
  {
    _id: "p5",
    name: "Diamond Stud Earrings in 14K White Gold",
    category: "luxury",
    brand: "Lumen Fine Jewelry",
    price: 299.00,
    originalPrice: 399.00,
    stock: 6,
    status: "active",
    rating: 4.9,
    reviewsCount: 1100,
    arrival: true,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Elegant round-cut lab-grown diamond stud earrings set in solid 14k white gold four-prong baskets with secure friction backs.",
    specs: {
      "Total Carat Weight": "1.00 ctw",
      "Metal": "14K Solid White Gold"
    }
  },
  {
    _id: "p6",
    name: "Premium ANC Wireless Headphones (Rose Pink)",
    category: "electronics",
    brand: "Sony",
    price: 189.99,
    originalPrice: 249.99,
    stock: 12,
    status: "active",
    rating: 4.7,
    reviewsCount: 840,
    arrival: true,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
    ],
    description: "High-resolution wireless audio featuring dual noise canceling microphones, custom 40mm drivers, and up to 40 hours of continuous wireless playback.",
    specs: {
      "Battery Life": "40 hours ANC ON",
      "Connectivity": "Bluetooth 5.3 + Aux"
    }
  },
  {
    _id: "p7",
    name: "Designer Italian Leather Crossbody Bag",
    category: "luxury",
    brand: "Milano Leather",
    price: 420.00,
    originalPrice: 550.00,
    stock: 3,
    status: "active",
    rating: 4.8,
    reviewsCount: 310,
    arrival: false,
    isSale: true,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Handcrafted in Florence using full-grain pebbled calfskin. Features custom pale gold hardware and adjustable crossbody strap.",
    specs: {
      "Origin": "Made in Italy",
      "Hardware": "18K Gold Plated Brass"
    }
  },
  {
    _id: "p8",
    name: "Botanical Ceramic Vase & Dried Flower Set",
    category: "home",
    brand: "Kinto",
    price: 38.50,
    originalPrice: 50.00,
    stock: 0,
    status: "out_of_stock",
    rating: 4.5,
    reviewsCount: 215,
    arrival: false,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Handcrafted matte ceramic vase complete with a preserved natural bundle of eucalyptus and baby's breath.",
    specs: {
      "Height": "8.5 inches",
      "Finish": "Unglazed matte stoneware"
    }
  },
  {
    _id: "p9",
    name: "Luminous Hydrating Glow Skincare Trio",
    category: "beauty",
    brand: "Lumen Beauty",
    price: 64.00,
    originalPrice: 85.00,
    stock: 18,
    status: "active",
    rating: 4.9,
    reviewsCount: 650,
    arrival: true,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608248597309-45da1e07ab93?auto=format&fit=crop&w=800&q=80"
    ],
    description: "A 3-step dermatologist-tested skincare routine formulated with hyaluronic acid, squalane, and vitamin C.",
    specs: {
      "Set Includes": "Cleanser, Serum, Cream",
      "Formula": "Cruelty-free, Vegan"
    }
  },
  {
    _id: "p10",
    name: "Fresh Organic Farm-to-Table Produce Basket",
    category: "groceries",
    brand: "Green Harvest",
    price: 29.99,
    originalPrice: 35.00,
    stock: 10,
    status: "active",
    rating: 4.7,
    reviewsCount: 430,
    arrival: false,
    isSale: false,
    images: [
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Curated weekly crate of pesticide-free local organic vegetables including crisp heirloom tomatoes, bell peppers, fresh kale, and avocados.",
    specs: {
      "Weight": "Approx. 10-12 lbs",
      "Certification": "USDA Certified Organic"
    }
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { _id: "c1", slug: "electronics", name: "Electronics", icon: "devices", description: "Smartphones, laptops, audio gear, and cutting-edge gadgetry." },
  { _id: "c2", slug: "fashion", name: "Fashion", icon: "apparel", description: "Apparel, footwear, and designer streetwear for men and women." },
  { _id: "c3", slug: "luxury", name: "Luxury", icon: "diamond", description: "High-end jewelry, fine timepieces, Italian leather, and collectibles." },
  { _id: "c4", slug: "home", name: "Home Decor", icon: "chair", description: "Modern furniture, aesthetic decor, kitchenware, and lighting." },
  { _id: "c5", slug: "beauty", name: "Beauty", icon: "spa", description: "Premium cosmetics, skincare serums, fragrances, and wellness." },
  { _id: "c6", slug: "groceries", name: "Groceries", icon: "nutrition", description: "Fresh produce, artisanal beverages, and gourmet pantry essentials." }
];

export const INITIAL_ORDERS: Order[] = [
  {
    _id: "ord_101",
    orderNumber: "01766703570",
    customer: { _id: "cust_1", name: "Muhammad Fateh", email: "fateh.m@example.com" },
    items: [
      { product: "p1", name: "iPhone 16 Pro Max 256GB Titanium", price: 1099.00, quantity: 2, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80" },
      { product: "p6", name: "Premium ANC Wireless Headphones", price: 189.99, quantity: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" }
    ],
    subtotal: 2387.99,
    tax: 191.04,
    shipping: 0,
    discount: 0,
    total: 2579.03,
    paymentMethod: "Credit Card (Mastercard)",
    status: "Completed",
    address: "450 Innovation Way, Suite 300, San Jose, CA 95110",
    orderNotes: "Express door delivery requested.",
    createdAt: "2026-08-01T10:30:00.000Z"
  },
  {
    _id: "ord_102",
    orderNumber: "01766707087",
    customer: { _id: "cust_2", name: "Kazi Mukarram", email: "kazi.muk@example.com" },
    items: [
      { product: "p9", name: "Luminous Hydrating Glow Skincare Trio", price: 64.00, quantity: 3, image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80" },
      { product: "p5", name: "Diamond Stud Earrings in 14K Gold", price: 299.00, quantity: 1, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80" }
    ],
    subtotal: 491.00,
    tax: 39.28,
    shipping: 15.00,
    discount: 0,
    total: 545.28,
    paymentMethod: "Cash on Delivery",
    status: "Pending",
    address: "128 Oakridge Ave, Austin, TX 78701",
    orderNotes: "Call customer prior to drop off.",
    createdAt: "2026-08-02T14:15:00.000Z"
  },
  {
    _id: "ord_103",
    orderNumber: "01766701234",
    customer: { _id: "cust_3", name: "Alex Morgan", email: "alex.morgan@lumen.com" },
    items: [
      { product: "p2", name: "Samsung Galaxy S24 Ultra 12GB", price: 999.99, quantity: 1, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80" }
    ],
    subtotal: 999.99,
    tax: 80.00,
    shipping: 0,
    discount: 50.00,
    total: 1029.99,
    paymentMethod: "PayPal",
    status: "Shipped",
    address: "88 Market Street, Floor 12, Seattle, WA 98101",
    orderNotes: "Leave with front desk.",
    createdAt: "2026-08-03T09:45:00.000Z"
  }
];

export const INITIAL_CUSTOMERS: CustomerData[] = [
  {
    _id: "cust_1",
    name: "Muhammad Fateh",
    email: "fateh.m@example.com",
    phone: "+1 (555) 019-2831",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    tier: "Pro Customer",
    totalOrders: 12,
    totalSpent: 14250.00,
    address: "450 Innovation Way, Suite 300, San Jose, CA 95110",
    registeredAt: "2025-11-10"
  },
  {
    _id: "cust_2",
    name: "Kazi Mukarram",
    email: "kazi.muk@example.com",
    phone: "+1 (555) 241-9840",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    tier: "Standard",
    totalOrders: 4,
    totalSpent: 1850.50,
    address: "128 Oakridge Ave, Austin, TX 78701",
    registeredAt: "2026-01-15"
  },
  {
    _id: "cust_3",
    name: "Alex Morgan",
    email: "alex.morgan@lumen.com",
    phone: "+1 (555) 312-8871",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    tier: "VIP Customer",
    totalOrders: 28,
    totalSpent: 38400.00,
    address: "88 Market Street, Floor 12, Seattle, WA 98101",
    registeredAt: "2025-05-20"
  }
];
