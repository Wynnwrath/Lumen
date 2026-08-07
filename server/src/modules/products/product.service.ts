import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import type { CreateProductInput, UpdateProductInput, ProductQuery } from "./product.validator.js";
import { requireFound } from "../../utils/requireFound.js";
import { AppError } from "../../utils/AppError.js";

export const productService = {
  async findAll(query: ProductQuery) {
    const where: Prisma.ProductWhereInput = { status: { not: "inactive" } };

    if (query.category) where.category = query.category;
    if (query.inStock === "true") where.stock = { gt: 0 };
    if (query.onSale === "true") where.isSale = true;
    if (query.minPrice || query.maxPrice) {
      where.price = {
        ...(query.minPrice ? { gte: query.minPrice } : {}),
        ...(query.maxPrice ? { lte: query.maxPrice } : {}),
      };
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const orderByMap = {
      "price-low": { price: "asc" },
      "price-high": { price: "desc" },
      rating: { rating: "desc" },
      newest: { createdAt: "desc" },
    } as const;

    const orderBy: Prisma.ProductOrderByWithRelationInput = orderByMap[query.sort || "newest"];

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      prisma.product.count({ where }),
    ]);

    return { products: items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    return requireFound(product, "Product");
  },

  async findAllForAdmin() {
    const [products, total] = await Promise.all([
      prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.product.count(),
    ]);
    return { products, total, page: 1, limit: products.length, totalPages: 1 };
  },

  async create(input: CreateProductInput) {
    return prisma.product.create({
      data: {
        ...input,
        description: input.description ?? "",
        status: (input.stock ?? 0) <= 0 ? "out_of_stock" : input.status || "active",
      },
    });
  },

  async update(id: string, input: UpdateProductInput) {
    const existing = requireFound(await prisma.product.findUnique({ where: { id } }), "Product");
    const stock = input.stock ?? existing.stock;
    const newStatus = stock <= 0 && existing.status !== "inactive" ? "out_of_stock" : undefined;
    return prisma.product.update({
      where: { id },
      data: { ...input, ...(newStatus ? { status: newStatus } : {}) },
    });
  },

  async remove(id: string) {
    const product = requireFound(await prisma.product.findUnique({ where: { id } }), "Product");
    const orderCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      throw new AppError(
        `Cannot delete "${product.name}" — it appears in ${orderCount} order(s). Set it to inactive instead.`,
        400,
        "PRODUCT_HAS_ORDERS"
      );
    }
    await prisma.product.delete({ where: { id } });
    return product;
  },
};
