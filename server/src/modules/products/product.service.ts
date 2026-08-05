import { ProductModel } from "./product.model.js";
import type { CreateProductInput, UpdateProductInput, ProductQuery } from "./product.validator.js";
import { paginate } from "../../utils/paginate.js";
import { requireFound } from "../../utils/requireFound.js";
import type { FilterQuery } from "mongoose";
import type { IProduct } from "./product.model.js";

export const productService = {
  async findAll(query: ProductQuery) {
    const filter: FilterQuery<IProduct> = { status: { $ne: "inactive" } };

    if (query.category) filter.category = query.category;
    if (query.brand) filter.brand = query.brand;
    if (query.inStock === "true") filter.stock = { $gt: 0 };
    if (query.onSale === "true") filter.isSale = true;
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { brand: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };
    const sort = sortMap[query.sort || "newest"] || sortMap.newest;

    const result = await paginate(ProductModel, filter, {
      sort,
      page: query.page,
      limit: query.limit,
    });

    return { products: result.items, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  },

  async findById(id: string) {
    const product = await ProductModel.findById(id).lean();
    return requireFound(product, "Product");
  },

  async create(input: CreateProductInput) {
    const product = await ProductModel.create({
      ...input,
      status: (input.stock ?? 0) <= 0 ? "out_of_stock" : input.status || "active",
    });
    return product.toObject();
  },

  async update(id: string, input: UpdateProductInput) {
    const product = requireFound(await ProductModel.findById(id), "Product");

    Object.assign(product, input);
    if ((input.stock ?? product.stock) <= 0 && product.status !== "inactive") {
      product.status = "out_of_stock";
    }
    await product.save();
    return product.toObject();
  },

  async remove(id: string) {
    const product = requireFound(await ProductModel.findByIdAndDelete(id), "Product");
    return product;
  },
};
