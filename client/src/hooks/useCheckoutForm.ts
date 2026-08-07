import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { useAuthStore } from "../stores/auth.store";
import { useToast } from "../components/common/ToastProvider";
import { createOrder } from "../api/orders";
import { getErrorMessage } from "../api/client";
import { checkCoupon, calculateOrderTotals } from "../services/pricing";
import type { Order } from "../types";

export type PaymentMethod = "Cash on Delivery" | "E-Wallet" | "Bank Transfer";
export type CouponMessage = { text: string; isError: boolean } | null;

export const useCheckoutForm = () => {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState(user ? user.email : "");
  const [emailOffers, setEmailOffers] = useState(true);
  const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home");
  const [country, setCountry] = useState("PH");
  const [firstName, setFirstName] = useState(user ? user.name.split(" ")[0] || "Juan" : "Juan");
  const [lastName, setLastName] = useState(user ? user.name.split(" ").slice(1).join(" ") || "Dela Cruz" : "Dela Cruz");
  const [address, setAddress] = useState("123 Mabini St.");
  const [showAptField, setShowAptField] = useState(false);
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("Manila");
  const [stateZip, setStateZip] = useState("1000");
  const [phone, setPhone] = useState("+63 917 555 0123");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
  const [orderNotes, setOrderNotes] = useState("");

  // Promo Coupon Engine State
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscountRate, setAppliedDiscountRate] = useState(0);
  const [couponMessage, setCouponMessage] = useState<CouponMessage>(null);

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const totals = calculateOrderTotals(items, appliedDiscountRate);
  const { subtotal: rawSubtotal, discountAmount, shippingFee, estimatedTax, grandTotal } = totals;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const result = await checkCoupon(couponCode, rawSubtotal);
    if (result) {
      setAppliedDiscountRate(result.rate);
      setCouponMessage({ text: result.label, isError: false });
    } else {
      setCouponMessage({ text: "Invalid Coupon Code. Try 'LUMEN10'", isError: true });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!user) {
      showToast("Please sign in to place an order", "info");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrder = await createOrder({
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        address: `${address}${apt ? `, ${apt}` : ""}, ${city}, ${stateZip} (${country})`,
        paymentMethod,
        couponCode: appliedDiscountRate > 0 ? couponCode.trim().toUpperCase() : undefined,
        orderNotes: orderNotes || undefined,
      });

      clearCart();
      setIsSubmitting(false);
      setPlacedOrder(newOrder);
    } catch (error) {
      setIsSubmitting(false);
      const msg = getErrorMessage(error);
      showToast(msg, "error");
    }
  };

  return {
    // Form fields + setters
    email,
    setEmail,
    emailOffers,
    setEmailOffers,
    deliveryType,
    setDeliveryType,
    country,
    setCountry,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    address,
    setAddress,
    showAptField,
    setShowAptField,
    apt,
    setApt,
    city,
    setCity,
    stateZip,
    setStateZip,
    phone,
    setPhone,
    paymentMethod,
    setPaymentMethod,
    orderNotes,
    setOrderNotes,
    // Promo coupon state
    couponCode,
    setCouponCode,
    appliedDiscountRate,
    couponMessage,
    // Submission state
    isSubmitting,
    placedOrder,
    // Handlers
    handleApplyCoupon,
    handleSubmitOrder,
    // Derived totals
    rawSubtotal,
    discountAmount,
    shippingFee,
    estimatedTax,
    grandTotal,
  };
};
