export interface HeroSlideMatch {
  name?: string;
  category?: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  badgeColor: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
  cta: string;
  match?: HeroSlideMatch;
}

export const HERO_SLIDES: HeroSlide[] = [
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
    match: { name: "iPhone" },
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
    match: { category: "fashion" },
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
    match: { category: "luxury" },
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
    match: { name: "Headphones" },
  },
];

export const DEFAULT_CATEGORIES = [
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

export const CATEGORY_COLORS: Record<string, string> = {
  devices: "bg-blue-500/10 text-secondary dark:text-blue-400 border-blue-500/20",
  apparel: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  checkroom: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  diamond: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  chair: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  spa: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  shopping_basket: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  nutrition: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};
