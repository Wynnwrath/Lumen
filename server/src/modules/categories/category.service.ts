import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { requireFound } from "../../utils/requireFound.js";
import type { CreateCategoryInput } from "./category.validator.js";

const findOrThrow = async (slug: string) =>
  requireFound(await prisma.category.findUnique({ where: { slug } }), "Category");

export const categoryService = {
  async findAll() {
    return prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  },

  async create(input: CreateCategoryInput) {
    return prisma.category.create({ data: { ...input, description: input.description ?? "" } });
  },

  async update(slug: string, input: Partial<CreateCategoryInput>) {
    await findOrThrow(slug);
    return prisma.category.update({ where: { slug }, data: input });
  },

  async remove(slug: string) {
    const category = await findOrThrow(slug);
    // Categories still used by products can't be deleted.
    const assignedCount = await prisma.product.count({ where: { category: slug } });
    if (assignedCount > 0) {
      throw new AppError(
        `Cannot delete category "${category.name}" — ${assignedCount} product(s) assigned.`,
        400,
        "CATEGORY_ASSIGNED",
        { assignedCount }
      );
    }
    await prisma.category.delete({ where: { slug } });
    return category;
  },
};
