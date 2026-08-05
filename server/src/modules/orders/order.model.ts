import mongoose, { type Document, type Model } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Shipped" | "Completed" | "Cancelled";

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  address: string;
  couponUsed?: string;
  orderNotes?: string;
  createdAt: Date;
}

const orderItemSchema = new mongoose.Schema<IOrderItem>(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Preparing", "Shipped", "Completed", "Cancelled"],
      default: "Pending",
    },
    address: { type: String, required: true },
    couponUsed: { type: String },
    orderNotes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = "LMN-" + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

export const OrderModel: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);
