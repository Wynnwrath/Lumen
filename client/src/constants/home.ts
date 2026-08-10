// Static content for the HomePage hero carousel, category chips, and colors.
// `match` on each slide ties the banner to a real product for quick-buy.

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
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1600&q=80",
    link: "/products?category=electronics",
    cta: "Shop Now",
    match: { name: "iPhone" },
  },
  {
    id: "p-footwear",
    badge: "Flash Sale",
    badgeColor: "bg-red-600 text-white",
    icon: "local_fire_department",
    title: "Jordan Brooklyn Hoodie",
    subtitle: "Flash Sale · Now $45.00 (was $65.00)",
    description: "Midweight brushed fleece hoodie with iconic Jumpman branding.",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1600&q=80",
    link: "/products?category=fashion",
    cta: "Shop Now",
    match: { category: "fashion" },
  },
  {
    id: "p-watches",
    badge: "Luxury Series",
    badgeColor: "bg-amber-500 text-black",
    icon: "diamond",
    title: "Diamond Stud Earrings",
    subtitle: "Luxury · Now $299.00 (was $399.00)",
    description: "Elegant lab-grown diamond stud earrings in solid 14k white gold.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1600&q=80",
    link: "/products?category=luxury",
    cta: "Shop Now",
    match: { category: "luxury" },
  },
  {
    id: "p-audio",
    badge: "New Arrival",
    badgeColor: "bg-emerald-600 text-white",
    icon: "headphones",
    title: "ANC Wireless Headphones",
    subtitle: "New Arrival · Now $189.99 (was $249.99)",
    description: "Hi-res wireless audio with dual noise canceling microphones and 40-hour battery.",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80",
    link: "/products?category=electronics",
    cta: "Shop Now",
    match: { name: "Headphones" },
  },
];

// Styling metadata for known category slugs (label/icon/color). Categories
// come from the API; this only adds a nicer look for the ones we know.
export const CATEGORY_META: Record<string, { label: string; icon: string; bgColor: string }> = {
  electronics: {
    label: "Electronics",
    icon: "devices",
    bgColor: "bg-blue-500/10 text-secondary dark:text-blue-400 border-blue-500/20",
  },
  fashion: {
    label: "Fashion",
    icon: "apparel",
    bgColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  luxury: {
    label: "Luxury",
    icon: "diamond",
    bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  home: {
    label: "Home Decor",
    icon: "chair",
    bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  beauty: {
    label: "Beauty",
    icon: "spa",
    bgColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  groceries: {
    label: "Groceries",
    icon: "nutrition",
    bgColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
};
