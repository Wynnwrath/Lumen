import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import type { CreateOrderInput, OrderQuery } from "./order.validator.js";
import type { OrderStatus } from "./order.model.js";
import { AppError } from "../../utils/AppError.js";
import { requireFound } from "../../utils/requireFound.js";
import { calcDiscount } from "../../utils/calcDiscount.js";
import { sendOrderConfirmation } from "../../utils/email.js";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).slice(-4);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LMN-${ts}${rand}`;
}

export const orderService = {
  async createOrder(input: CreateOrderInput, customerId: string) {
    const order = await prisma.$transaction(async (tx) => {
      const productIds = input.items.map((i) => i.product);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];
      for (const item of input.items) {
        const product = productMap.get(item.product);
        if (!product) throw new AppError(`Product ${item.product} not found`, 404, "NOT_FOUND");
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

        const result = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400, "INSUFFICIENT_STOCK");
        }
        if (product.stock - item.quantity === 0) {
          await tx.product.update({ where: { id: product.id }, data: { status: "out_of_stock" } });
        }
      }

      const shipping = subtotal >= 100 ? 0 : 12.0;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      let discount = 0;

      if (input.couponCode) {
        const coupon = await tx.coupon.findFirst({
          where: { code: input.couponCode.toUpperCase(), isActive: true },
        });
        if (!coupon) throw new AppError("Invalid or expired coupon", 400, "INVALID_COUPON");
        discount = Math.min(calcDiscount(subtotal, coupon.discountPercent), subtotal);
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
        include: { customer: { select: { id: true, name: true, email: true } }, items: true },
      });

      return order;
    });

    const user = await prisma.user.findUnique({
      where: { id: customerId },
      select: { email: true, name: true },
    });
    if (user) {
      void sendOrderConfirmation(user.email, {
        orderNumber: order.orderNumber,
        customerName: user.name,
        total: order.total,
        items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      }).catch((err) => console.error("Order email failed:", err));
    }

    return order;
  },

  async getAll(query: OrderQuery) {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          items: true,
        },
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

  async getMine(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async exportCsv() {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const escape = (value: unknown): string => {
      const s = String(value ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const header = [
      "Order Number",
      "Customer Name",
      "Customer Email",
      "Order Date",
      "Subtotal",
      "Tax",
      "Shipping",
      "Discount",
      "Total",
      "Payment Method",
      "Status",
      "Address",
      "Items",
    ].join(",");

    const rows = orders.map((o) =>
      [
        o.orderNumber,
        o.customer.name,
        o.customer.email,
        o.createdAt.toISOString(),
        o.subtotal.toFixed(2),
        o.tax.toFixed(2),
        o.shipping.toFixed(2),
        o.discount.toFixed(2),
        o.total.toFixed(2),
        o.paymentMethod,
        o.status,
        o.address,
        o.items.map((i) => `${i.name} x${i.quantity}`).join(" | "),
      ]
        .map(escape)
        .join(",")
    );

    return [header, ...rows].join("\r\n");
  },

  async updateStatus(orderNumber: string, status: OrderStatus) {
    return prisma.order.update({
      where: { orderNumber },
      data: { status },
    });
  },
};
