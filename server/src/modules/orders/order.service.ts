import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import type { CreateOrderInput } from "./order.validator.js";
import { AppError } from "../../utils/AppError.js";
import { requireFound } from "../../utils/requireFound.js";
import { calcDiscount } from "../../utils/calcDiscount.js";

function generateOrderNumber(): string {
  return "LMN-" + Math.floor(100000 + Math.random() * 900000);
}

export const orderService = {
  async createOrder(input: CreateOrderInput, customerId: string) {
    return prisma.$transaction(async (tx) => {
      const productIds = input.items.map((i) => i.product);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];
      for (const item of input.items) {
        const product = productMap.get(item.product);
        if (!product) throw new AppError(`Product ${item.product} not found`, 404);
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400, "INSUFFICIENT_STOCK");
        }
        subtotal += product.price * item.quantity;
        orderItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: (product.images as string[])?.[0] || "",
        });

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.quantity },
            ...(product.stock - item.quantity === 0 ? { status: "out_of_stock" } : {}),
          },
        });
      }

      const shipping = subtotal >= 100 ? 0 : 12.0;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      let discount = 0;

      if (input.couponCode) {
        const coupon = await tx.coupon.findFirst({
          where: { code: input.couponCode.toUpperCase(), isActive: true },
        });
        if (!coupon) throw new AppError("Invalid or expired coupon", 400, "INVALID_COUPON");
        discount = calcDiscount(subtotal, coupon.discountPercent);
      }

      const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId,
          items: { createMany: { data: orderItems } },
          subtotal,
          tax,
          shipping,
          discount,
          total,
          paymentMethod: input.paymentMethod,
          address: input.address,
          couponUsed: input.couponCode?.toUpperCase(),
          orderNotes: input.orderNotes,
        },
        include: { items: { include: { product: true } } },
      });

      return order;
    });
  },

  async getAll(query: Record<string, string>) {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { customer: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders: items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getByOrderNumber(orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { customer: { select: { id: true, name: true, email: true } }, items: true },
    });
    return requireFound(order, "Order");
  },

  async updateStatus(orderNumber: string, status: string) {
    return prisma.order.update({
      where: { orderNumber },
      data: { status },
    });
  },
};
