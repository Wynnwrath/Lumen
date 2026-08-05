import { z } from "zod";

const specsSchema = z.record(z.string(), z.string()).optional();

export const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().optional(),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(["active", "out_of_stock", "inactive"]).optional(),
  arrival: z.boolean().optional(),
  isSale: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  specs: specsSchema,
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.enum(["true", "false"]).optional(),
  onSale: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  sort: z.enum(["price-low", "price-high", "rating", "newest"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
