import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { useAuthStore } from "../stores/auth.store";
import { useToast } from "../components/ui/ToastProvider";
import { createOrder, getMyOrders } from "../api/orders";
import { getErrorMessage } from "../api/client";
import { checkCoupon, calculateOrderTotals } from "../services/pricing";
import type { Order } from "../types";

export type PaymentMethod = "Cash on Delivery" | "E-Wallet" | "Bank Transfer";
export type CouponMessage = { text: string; isError: boolean } | null;

// Best-effort reverse of the address template "addr[, apt], city, zip (country)".
function parseAddress(raw: string): { address: string; apt?: string; city: string; stateZip: string; country: string } | null {
  const m = raw.trim().match(/^(.*),\s*(.*?),\s*(\S+)\s*\((.*)\)\s*$/);
  if (!m) return null;
  const beforeCity = (m[1] ?? "").trim();
  const parts = beforeCity.split(",").map((p) => p.trim());
  return {
    address: parts[0] ?? "",
    apt: parts.slice(1).join(", ") || undefined,
    city: (m[2] ?? "").trim(),
    stateZip: (m[3] ?? "").trim(),
    country: (m[4] ?? "").trim(),
  };
}

// All checkout form state + logic in one place so CheckoutPage stays readable.
export const useCheckoutForm = () => {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form States. Start empty/real so returning shoppers get their saved
  // details pre-filled (from their last order) instead of demo placeholders.
  const [email, setEmail] = useState("");
  const [emailOffers, setEmailOffers] = useState(true);
  const [country, setCountry] = useState("Metro Manila");
  const [firstName, setFirstName] = useState(user ? user.name.split(" ")[0] || "Juan" : "Juan");
  const [lastName, setLastName] = useState(user ? user.name.split(" ").slice(1).join(" ") || "Dela Cruz" : "Dela Cruz");
  const [address, setAddress] = useState("");
  const [showAptField, setShowAptField] = useState(false);
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("");
  const [stateZip, setStateZip] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
  const [orderNotes, setOrderNotes] = useState("");

  // Pre-fill from the customer's most recent order (email, address, payment
  // method) so returning shoppers don't re-type their saved details.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getMyOrders()
      .then((orders) => {
        const last = orders[0];
        if (cancelled || !last) return;
        setEmail(last.email || "");
        setPaymentMethod(last.paymentMethod as PaymentMethod);
        const parsed = parseAddress(last.address);
        if (parsed) {
          setAddress(parsed.address);
          setApt(parsed.apt ?? "");
          setCity(parsed.city);
          setStateZip(parsed.stateZip);
          setCountry(parsed.country);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Promo Coupon Engine State
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscountRate, setAppliedDiscountRate] = useState(0);
  const [couponMessage, setCouponMessage] = useState<CouponMessage>(null);

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Step navigation (1 = Review, 2 = Details, 3 = Confirmation).
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    setCurrentStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totals = calculateOrderTotals(items, appliedDiscountRate);
  const { subtotal: subtotalBeforeDiscount, discountAmount, shippingFee, estimatedTax, grandTotal } = totals;

  // Asks the server to validate the code, then applies it as a discount rate.
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const result = await checkCoupon(couponCode, subtotalBeforeDiscount);
    if (result) {
      setAppliedDiscountRate(result.discountRate);
      setCouponMessage({ text: result.label, isError: false });
    } else {
      setCouponMessage({ text: "Invalid Coupon Code. Try 'LUMEN10'", isError: true });
    }
  };

  // Places the order on the final step. Steps 1-2 are advanced via nextStep().
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!user) {
      showToast("Please sign in to place an order", "info");
      navigate("/login");
      return;
    }

    // Show the "Placing your order..." wait screen while the API call is in flight.
    setCurrentStep(3);
    setIsSubmitting(true);

    try {
      const newOrder = await createOrder({
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        address: `${address}${apt ? `, ${apt}` : ""}, ${city}, ${stateZip} (${country})`,
        paymentMethod,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        couponCode: appliedDiscountRate > 0 ? couponCode.trim().toUpperCase() : undefined,
        orderNotes: orderNotes || undefined,
      });

      clearCart();
      setIsSubmitting(false);
      setPlacedOrder(newOrder);
    } catch (error) {
      setIsSubmitting(false);
      setCurrentStep(2);
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
    // Step navigation
    currentStep,
    nextStep,
    prevStep,
    // Derived totals
    subtotalBeforeDiscount,
    discountAmount,
    shippingFee,
    estimatedTax,
    grandTotal,
  };
};
