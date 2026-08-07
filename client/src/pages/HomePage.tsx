import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import { useCartStore } from "../stores/cart.store";
import type { Product } from "../types";
import { Icon } from "../components/common/Icon";
import { ProductCard, trackSpotlight } from "../components/common/ProductCard";
import { useToast } from "../components/common/ToastProvider";

const HERO_SLIDES = [
  {
    id: "p1",
    badge: "Flagship Launch",
    badgeColor: "bg-secondary/90 text-white",
    icon: "auto_awesome",
    title: "iPhone 16 Pro Max",
    subtitle: "Starting from $1,099.00",
    description: "Powered by the revolutionary A18 Pro chip with hardware-accelerated ray tracing and titanium architecture.",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1600&q=80",
    link: "/products?category=electronics",
    cta: "Shop Now",
  },
  {
    id: "p-footwear",
    badge: "Flash Sale",
    badgeColor: "bg-red-600 text-white",
    icon: "local_fire_department",
    title: "Summer Footwear",
    subtitle: "Up to 40% OFF Top Athletic Brands",
    description: "Lightweight, breathable performance sneakers designed for modern comfort and active outdoor lifestyles.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
    link: "/products?category=fashion",
    cta: "Shop Collection",
  },
  {
    id: "p-watches",
    badge: "Luxury Series",
    badgeColor: "bg-amber-500 text-black",
    icon: "diamond",
    title: "Precision Chronographs",
    subtitle: "Crafted with Sapphire Crystal Glass",
    description: "Swiss-inspired automatic movement with scratch-resistant titanium casing and luminescent hands.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
    link: "/products?category=luxury",
    cta: "Explore Watches",
  },
  {
    id: "p-audio",
    badge: "New Arrival",
    badgeColor: "bg-emerald-600 text-white",
    icon: "headphones",
    title: "Studio Headphones",
    subtitle: "Lossless Acoustic Performance",
    description: "Active noise cancellation with 40-hour battery life and spatial audio support for audiophiles.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
    link: "/products?category=electronics",
    cta: "Discover Audio",
  },
];

const DEFAULT_CATEGORIES = [
  {
    id: "electronics",
    label: "Electronics",
    icon: "devices",
    bgColor: "bg-blue-500/10 text-secondary dark:text-blue-400 border-blue-500/20",
  },
  {
    id: "fashion",
    label: "Fashion",
    icon: "apparel",
    bgColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    id: "luxury",
    label: "Luxury",
    icon: "diamond",
    bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    id: "home",
    label: "Home Decor",
    icon: "chair",
    bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: "spa",
    bgColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  {
    id: "groceries",
    label: "Groceries",
    icon: "nutrition",
    bgColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  devices: "bg-blue-500/10 text-secondary dark:text-blue-400 border-blue-500/20",
  apparel: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  checkroom: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  diamond: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  chair: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  spa: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  shopping_basket: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  nutrition: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

type DisplayCategory = { id: string; label: string; icon: string; bgColor: string };

function mapCategories(cats: { slug: string; name: string; icon: string }[]): DisplayCategory[] {
  return cats.map((c) => ({
    id: c.slug,
    label: c.name,
    icon: c.icon || "category",
    bgColor: CATEGORY_COLORS[c.icon] || "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  }));
}

export const HomePage = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<DisplayCategory[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Carousel Hero Banner States
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ limit: 100 })
      .then((res) => setAllProducts(res.products))
      .catch(() => setAllProducts([]));
  }, []);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        if (cats.length > 0) setCategories(mapCategories(cats));
      })
      .catch(() => {});
  }, []);

  // Auto-play interval: 3 seconds per slide, sliding left with ease-in-out
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Filter & sort products logic
  const displayProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result.slice(0, 4);
  }, [allProducts, selectedCategory, sortBy]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem(product, 1);
    showToast(`Added "${product.name}" to cart!`, "success");
  };

  const handleQuickBuyHero = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    const prod = allProducts.find((p) => p._id === productId) || allProducts[0];
    if (prod) {
      addItem(prod, 1);
      showToast(`Added "${prod.name}" to cart!`, "success");
    }
  };

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory("all");
    } else {
      setSelectedCategory(catId);
    }
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  return (
    <main className="max-w-container-max mx-auto px-3 sm:px-6 py-3 sm:py-8 space-y-4 sm:space-y-10 flex-grow w-full">
      {/* 4-SLIDE AUTOMATED CAROUSEL HERO BANNER */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-950 text-white border border-white/10 group"
      >
        {/* Animated Carousel Slides Wrapper */}
        <div
          className="flex transition-transform duration-700 ease-in-out w-full"
          style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              onMouseMove={trackSpotlight}
              className="w-full shrink-0 relative min-h-[220px] sm:min-h-[460px] flex items-center pl-12 pr-10 sm:px-16 py-5 sm:py-14 aurora-bg spotlight-card"
            >
              {/* Slide Background Image & Gradient Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>
              </div>

              {/* Slide Content */}
              <div className="relative z-10 max-w-xl space-y-2 sm:space-y-4">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 ${slide.badgeColor} rounded-full text-[9px] sm:text-xs font-extrabold uppercase tracking-wider shadow-md`}
                >
                  <Icon name={slide.icon} className="text-[11px] sm:text-sm" />
                  <span>{slide.badge}</span>
                </span>
                <h1 className="text-lg sm:text-5xl font-black text-white leading-tight tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-xs sm:text-2xl font-light text-secondary-fixed">
                  {slide.subtitle}
                </p>
                <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-md hidden sm:block">
                  {slide.description}
                </p>
                <div className="flex items-center gap-2 pt-1 sm:pt-3">
                  <button
                    onClick={(e) => handleQuickBuyHero(e, slide.id)}
                    className="bg-secondary hover:bg-secondary-container text-white px-3.5 py-2 sm:px-8 sm:py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center gap-1.5 quick-buy-btn btn-sheen whitespace-nowrap"
                  >
                    <Icon name="shopping_bag" className="text-sm sm:text-xl" />
                    <span>{slide.cta}</span>
                  </button>
                  <Link
                    to={slide.link}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-3 py-2 sm:px-7 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1 view-details-btn border border-white/15 whitespace-nowrap"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Prev/Next Arrow Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md flex items-center justify-center transition shadow-lg opacity-80 hover:opacity-100"
          title="Previous Banner"
        >
          <Icon name="chevron_left" className="text-base sm:text-2xl" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md flex items-center justify-center transition shadow-lg opacity-80 hover:opacity-100"
          title="Next Banner"
        >
          <Icon name="chevron_right" className="text-base sm:text-2xl" />
        </button>

        {/* Carousel Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${currentSlideIndex === idx ? "w-6 bg-secondary" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CATEGORY MARQUEE TICKER */}
      <section className="py-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-xs">
        <div className="marquee-wrapper flex overflow-hidden">
          <div className="marquee-content font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200">
            {categories.map((cat, i) => (
              <span key={i} className="flex items-center gap-2 hover:text-secondary transition cursor-pointer">
                <Icon name={cat.icon} className="text-secondary text-sm" />
                <span>{cat.label}</span>
              </span>
            ))}
          </div>
          <div className="marquee-content font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-slate-200" aria-hidden="true">
            {categories.map((cat, i) => (
              <span key={`dup-${i}`} className="flex items-center gap-2 hover:text-secondary transition cursor-pointer">
                <Icon name={cat.icon} className="text-secondary text-sm" />
                <span>{cat.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE CATEGORIES SECTION (EXACT ORIGINAL MATCH) */}
      <section id="categories-section" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-on-surface tracking-tight">Explore Categories</h2>
            <p className="text-xs text-outline">Browse hand-picked collections across top lifestyle &amp; tech domains</p>
          </div>
          <button
            onClick={() => {
              if (selectedCategory !== "all") {
                setSelectedCategory("all");
              } else {
                navigate("/products");
              }
            }}
            className="text-secondary text-xs sm:text-sm font-bold hover:underline flex items-center gap-0.5"
          >
            <span>{selectedCategory !== "all" ? "Show All" : "View All"}</span>
            <Icon name="chevron_right" className="text-sm" />
          </button>
        </div>

        {/* 6 Category Box Grid matching original index.html */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`category-card flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl bg-surface-container-lowest dark:bg-slate-800 hover:bg-surface-container border transition-all duration-300 group shadow-xs hover:shadow-md ${isActive
                    ? "border-secondary ring-2 ring-secondary/30 shadow-md"
                    : "border-outline-variant/40 hover:border-secondary/50"
                  }`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${cat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}
                >
                  <Icon name={cat.icon} className="category-card-icon text-2xl sm:text-3xl" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-on-surface text-center line-clamp-1">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Products Section with 2-Column Mobile Grid */}
      <section className="space-y-3 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-outline">Top picks curated for your style and tech needs</p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-outline font-semibold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-lowest dark:bg-slate-800 text-on-surface text-xs font-bold rounded-xl border border-outline-variant/50 py-1.5 px-3 focus:ring-2 focus:ring-secondary focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* 2-Column Grid on Mobile Viewports */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>

        {/* View Full Catalog CTA Button */}
        <div className="text-center pt-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-container text-white px-9 py-4 rounded-full font-extrabold text-sm shadow-md transition-all hover:scale-105 active:scale-95 btn-sheen"
          >
            <span>Explore Full Catalog ({allProducts.length}+ Products)</span>
            <Icon name="arrow_forward" className="text-lg" />
          </Link>
        </div>
      </section>
    </main>
  );
};
