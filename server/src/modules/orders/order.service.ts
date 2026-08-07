import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import type { CreateOrderInput, OrderQuery } from "./order.validator.js";
import type { OrderStatus } from "./order.model.js";
import { AppError } from "../../utils/AppError.js";
import { requireFound } from "../../utils/requireFound.js";
import { calcDiscount } from "../../utils/calcDiscount.js";
import { sendOrderConfirmation } from "../../utils/email.js";

// Human-friendly order reference like LMN-<timestamp><random>.
function generateOrderNumber(): string {
  const ts = Date.now().toString(36).slice(-4);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LMN-${ts}${rand}`;
}

// How long a "Completed" order waits for the customer to confirm receipt
// before it auto-transitions to "Received" (money release).
const RECEIVED_AUTO_DAYS = 3;

export const orderService = {
  // Places an order. Everything runs inside a transaction so it's all-or-nothing:
  // if any step fails (stock, coupon, insert) the whole order rolls back.
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
        // Snapshot name/price/image so past orders keep what the customer actually paid.
        orderItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: (product.images as string[])?.[0] || "",
        });

        // Lower stock; mark out_of_stock when it hits 0.
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.quantity },
            ...(product.stock - item.quantity === 0 ? { status: "out_of_stock" } : {}),
          },
        });
      }

      // Same pricing rules the client preview uses.
      const shipping = subtotal >= 100 ? 0 : 12.0;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      let discount = 0;

      if (input.couponCode) {
        const coupon = await tx.coupon.findFirst({
          where: { code: input.couponCode.toUpperCase(), isActive: true },
        });
        if (!coupon) throw new AppError("Invalid or expired coupon", 400, "INVALID_COUPON");
        // Clamp so a huge percent can't make the total negative.
        discount = Math.min(calcDiscount(subtotal, coupon.discountPercent), subtotal);
        // Track redemptions for the admin coupon manager.
        await tx.coupon.update({
          where: { code: coupon.code },
          data: { usageCount: { increment: 1 } },
        });
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

    // Fire the confirmation email after the order is safely saved.
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

  // Admin list with status filter + pagination.
  async getAll(query: OrderQuery) {
    await this.autoFinalizeReceived();

    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

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
    await this.autoFinalizeReceived();

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { customer: { select: { id: true, name: true, email: true } }, items: true },
    });
    return requireFound(order, "Order");
  },

  // Orders belonging to the logged-in customer.
  async getMine(customerId: string) {
    await this.autoFinalizeReceived();

    return prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  // All orders flattened into a CSV for download.
  async exportCsv() {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Quote values that contain commas/quotes/newlines so the CSV stays valid.
    const escapeCsvField = (value: unknown): string => {
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
        .map(escapeCsvField)
        .join(",")
    );

    return [header, ...rows].join("\r\n");
  },

  async updateStatus(orderNumber: string, status: OrderStatus) {
    return prisma.order.update({
      where: { orderNumber },
      data: {
        status,
        // Stamp when the order becomes Completed (3-day auto-receive anchor);
        // clear it if the order moves away from Completed so the clock resets.
        completedAt: status === "Completed" ? new Date() : null,
      },
    });
  },

  // Customer confirms they received the order -> money released to the seller.
  // Owner-only and only allowed from "Completed".
  async confirmReceived(orderNumber: string, customerId: string) {
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
    if (order.customerId !== customerId) {
      throw new AppError("You do not own this order", 403, "FORBIDDEN");
    }
    if (order.status !== "Completed") {
      throw new AppError("Order must be Completed before confirming receipt", 400, "INVALID_STATUS");
    }
    return prisma.order.update({
      where: { orderNumber },
      data: { status: "Received", receivedAt: new Date() },
    });
  },

  // Flips stale "Completed" orders to "Received" once the 3-day window has
  // passed. Uses completedAt when available, otherwise falls back to createdAt
  // so pre-migration Completed orders still auto-finalize.
  async autoFinalizeReceived() {
    const cutoff = new Date(Date.now() - RECEIVED_AUTO_DAYS * 24 * 60 * 60 * 1000);
    const result = await prisma.order.updateMany({
      where: {
        status: "Completed",
        OR: [
          { completedAt: { not: null, lte: cutoff } },
          { completedAt: null, createdAt: { lte: cutoff } },
        ],
      },
      data: { status: "Received", receivedAt: new Date() },
    });
    if (result.count > 0) {
      console.log(`Auto-received ${result.count} completed order(s)`);
    }
    return result.count;
  },
};
