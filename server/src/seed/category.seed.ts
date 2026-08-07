import { prisma } from "../lib/prisma.js";

// Demo store departments.
const SEED_CATEGORIES = [
  { slug: "electronics", name: "Electronics", icon: "devices", description: "Smartphones, laptops, audio gear, and cutting-edge gadgetry." },
  { slug: "fashion", name: "Fashion", icon: "checkroom", description: "Apparel, footwear, and designer streetwear for men and women." },
  { slug: "home", name: "Home & Living", icon: "chair", description: "Modern furniture, aesthetic decor, kitchenware, and lighting." },
  { slug: "beauty", name: "Beauty & Skincare", icon: "spa", description: "Premium cosmetics, skincare serums, fragrances, and wellness." },
  { slug: "groceries", name: "Groceries", icon: "shopping_basket", description: "Fresh produce, artisanal beverages, and gourmet pantry essentials." },
  { slug: "luxury", name: "Luxury Items", icon: "diamond", description: "High-end jewelry, fine timepieces, Italian leather, and collectibles." },
];

// Only seeds if the table is empty (idempotent).
export async function seedCategories(): Promise<void> {
  const count = await prisma.category.count();
  if (count === 0) {
    await prisma.category.createMany({ data: SEED_CATEGORIES });
    console.log(`Seeded ${SEED_CATEGORIES.length} categories`);
  }
}
