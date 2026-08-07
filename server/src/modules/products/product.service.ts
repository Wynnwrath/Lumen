import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import type { CreateProductInput, UpdateProductInput, ProductQuery } from "./product.validator.js";
import { requireFound } from "../../utils/requireFound.js";
import { AppError } from "../../utils/AppError.js";

export const productService = {
  // Public product listing with filters, sorting, and pagination.
  async findAll(query: ProductQuery) {
    // Never show inactive products to shoppers.
    const where: Prisma.ProductWhereInput = { status: { not: "inactive" } };

    if (query.category) where.category = query.category;
    if (query.inStock === "true") where.stock = { gt: 0 };
    if (query.onSale === "true") where.isSale = true;
    if (query.minPrice || query.maxPrice) {
      const minPrice = Number(query.minPrice);
      const maxPrice = Number(query.maxPrice);
      where.price = {
        ...(minPrice ? { gte: minPrice } : {}),
        ...(maxPrice ? { lte: maxPrice } : {}),
      };
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    // Map a readable sort key to a Prisma orderBy object.
    const orderByMap = {
      "price-low": { price: "asc" },
      "price-high": { price: "desc" },
      rating: { rating: "desc" },
      newest: { createdAt: "desc" },
    } as const;

    const orderBy: Prisma.ProductOrderByWithRelationInput = orderByMap[query.sort || "newest"];

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    // Fetch the page of products and the total count in parallel.
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

  // Admin version: returns everything including inactive, no pagination.
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
        // A product with 0 stock can't be "active".
        status: (input.stock ?? 0) <= 0 ? "out_of_stock" : input.status || "active",
      },
    });
  },

  async update(id: string, input: UpdateProductInput) {
    const existing = requireFound(await prisma.product.findUnique({ where: { id } }), "Product");
    const stock = input.stock ?? existing.stock;
    // If stock drops to 0, flip status to out_of_stock (unless manually inactive).
    const newStatus = stock <= 0 && existing.status !== "inactive" ? "out_of_stock" : undefined;
    return prisma.product.update({
      where: { id },
      data: { ...input, ...(newStatus ? { status: newStatus } : {}) },
    });
  },

  async remove(id: string) {
    const product = requireFound(await prisma.product.findUnique({ where: { id } }), "Product");
    // Keep a product around if it's referenced by past orders (their items snapshot it).
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
