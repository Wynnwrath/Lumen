import { z } from "zod";

export const createCategorySchema = z.object({
  slug: z.string().min(1).transform((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
  name: z.string().min(1),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
