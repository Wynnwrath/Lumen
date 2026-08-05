import { CategoryModel } from "./category.model.js";
import { ProductModel } from "../products/product.model.js";
import { AppError } from "../../utils/AppError.js";
import { requireFound } from "../../utils/requireFound.js";
import type { CreateCategoryInput } from "./category.validator.js";

export const categoryService = {
  async findAll() {
    return CategoryModel.find().lean();
  },

  async create(input: CreateCategoryInput) {
    return CategoryModel.create(input);
  },

  async update(slug: string, input: Partial<CreateCategoryInput>) {
    const category = requireFound(await CategoryModel.findOne({ slug }), "Category");
    Object.assign(category, input);
    await category.save();
    return category.toObject();
  },

  async remove(slug: string) {
    const category = requireFound(await CategoryModel.findOne({ slug }), "Category");

    const assignedCount = await ProductModel.countDocuments({ category: slug });
    if (assignedCount > 0) {
      throw new AppError(
        `Cannot delete category "${category.name}" — ${assignedCount} product(s) assigned.`,
        400,
        "CATEGORY_ASSIGNED",
        { assignedCount }
      );
    }

    await CategoryModel.deleteOne({ slug });
    return category;
  },
};
