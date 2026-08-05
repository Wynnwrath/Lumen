import mongoose from "mongoose";
import { OrderModel, type OrderStatus } from "./order.model.js";
import { ProductModel } from "../products/product.model.js";
import { CouponModel } from "../coupons/coupon.model.js";
import type { CreateOrderInput } from "./order.validator.js";
import { AppError } from "../../utils/AppError.js";
import { paginate } from "../../utils/paginate.js";
import { requireFound } from "../../utils/requireFound.js";
import { calcDiscount } from "../../utils/calcDiscount.js";

export const orderService = {
  async createOrder(input: CreateOrderInput, customerId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const productIds = input.items.map((i) => i.product);
      const products = await ProductModel.find({ _id: { $in: productIds } }).session(session);

      const productMap = new Map(products.map((p) => [p._id.toString(), p]));

      let subtotal = 0;
      const orderItems = [];
      for (const item of input.items) {
        const product = productMap.get(item.product);
        if (!product) throw new AppError(`Product ${item.product} not found`, 404);
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400, "INSUFFICIENT_STOCK");
        }

        subtotal += product.price * item.quantity;
        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.images?.[0] || "",
        });

        product.stock -= item.quantity;
        if (product.stock === 0) product.status = "out_of_stock";
        await product.save({ session });
      }

      const shipping = subtotal >= 100 ? 0 : 12.0;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      let discount = 0;

      if (input.couponCode) {
        const coupon = await CouponModel.findOne({
          code: input.couponCode.toUpperCase(),
          isActive: true,
        }).session(session);
        if (!coupon) throw new AppError("Invalid or expired coupon", 400, "INVALID_COUPON");
        discount = calcDiscount(subtotal, coupon.discountPercent);
      }

      const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;

      const order = await OrderModel.create(
        [
          {
            customer: new mongoose.Types.ObjectId(customerId),
            items: orderItems,
            subtotal,
            tax,
            shipping,
            discount,
            total,
            paymentMethod: input.paymentMethod,
            address: input.address,
            couponUsed: input.couponCode?.toUpperCase(),
            orderNotes: input.orderNotes,
            status: "Pending",
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return (await OrderModel.findById(order[0]._id).populate("items.product").lean())!;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getAll(query: { status?: string; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;

    const result = await paginate(OrderModel, filter, {
      page: query.page,
      limit: query.limit,
      populate: { path: "customer", select: "name email" },
    });

    return { orders: result.items, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  },

  async getByOrderNumber(orderNumber: string) {
    const order = await OrderModel.findOne({ orderNumber }).populate("customer", "name email").lean();
    return requireFound(order, "Order");
  },

  async updateStatus(orderNumber: string, status: string) {
    const order = requireFound(await OrderModel.findOne({ orderNumber }), "Order");
    order.status = status as OrderStatus;
    await order.save();
    return order.toObject();
  },
};
