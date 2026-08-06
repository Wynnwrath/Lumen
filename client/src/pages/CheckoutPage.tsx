import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { useAuthStore } from "../stores/auth.store";
import { dataService } from "../services/dataService";
import type { Order } from "../types";
import { Icon } from "../components/common/Icon";

export const CheckoutPage: React.FC = () => {
  const { items, getSubtotal, getItemCount, updateQuantity, removeItem, clearCart } = useCartStore();
  const { user } = useAuthStore();

  // Urgency Timer State (Starting at 39:43 = 2383 seconds)
  const [secondsLeft, setSecondsLeft] = useState(2383);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Form States
  const [email, setEmail] = useState(user ? user.email : "Dezzlab.agency@gmail.com");
  const [emailOffers, setEmailOffers] = useState(true);
  const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home");
  const [country, setCountry] = useState("US");
  const [firstName, setFirstName] = useState(user ? user.name.split(" ")[0] || "Sean" : "Sean");
  const [lastName, setLastName] = useState(user ? user.name.split(" ").slice(1).join(" ") || "Sultan" : "Sultan");
  const [address, setAddress] = useState("123 Main Street");
  const [showAptField, setShowAptField] = useState(false);
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("New York");
  const [stateZip, setStateZip] = useState("NY 10001");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Delivery" | "E-Wallet" | "Bank Transfer">("Cash on Delivery");
  const [orderNotes, setOrderNotes] = useState("");

  // Promo Coupon Engine State
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscountRate, setAppliedDiscountRate] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const rawSubtotal = getSubtotal();
  const discountAmount = rawSubtotal * appliedDiscountRate;
  const subtotalAfterDiscount = rawSubtotal - discountAmount;
  const shippingFee = subtotalAfterDiscount > 100 || items.length === 0 ? 0 : 15.0;
  const estimatedTax = subtotalAfterDiscount * 0.08;
  const grandTotal = subtotalAfterDiscount + shippingFee + estimatedTax;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === "LUMEN10") {
      setAppliedDiscountRate(0.1);
      setCouponMessage({ text: "10% Discount Applied Successfully!", isError: false });
    } else {
      setCouponMessage({ text: "Invalid Coupon Code. Try 'LUMEN10'", isError: true });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder = dataService.addOrder({
        customer: {
          _id: user ? (user._id || user.id || "cust_guest") : "cust_guest",
          name: `${firstName} ${lastName}`.trim() || "Guest Customer",
          email: email || "guest@lumen.com",
        },
        items: items.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.images[0],
        })),
        subtotal: rawSubtotal,
        tax: estimatedTax,
        shipping: shippingFee,
        total: grandTotal,
        paymentMethod: paymentMethod,
        address: `${address}${apt ? `, ${apt}` : ""}, ${city}, ${stateZip} (${country})`,
        orderNotes: orderNotes || "Standard delivery instructions",
      });

      clearCart();
      setIsSubmitting(false);
      setPlacedOrder(newOrder);
    }, 1200);
  };

  // If Order Placed: Render Confirmation Receipt
  if (placedOrder) {
    return (
      <main className="flex-grow max-w-2xl w-full mx-auto px-3 sm:px-6 py-6 md:py-10">
        <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl border border-outline-variant/30 text-center space-y-5 animate-fade-up">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            <Icon name="check_circle" className="text-2xl" />
          </div>

          <h2 className="text-xl md:text-3xl font-black text-on-surface">Thank You For Your Order!</h2>
          <p className="text-xs text-outline">
            Order Reference:{" "}
            <strong className="text-secondary dark:text-secondary-fixed font-mono text-xs sm:text-sm">
              #{placedOrder.orderNumber}
            </strong>
          </p>

          <div className="bg-surface dark:bg-slate-700/50 rounded-2xl p-3.5 text-left text-xs space-y-1.5 border border-outline-variant/20">
            <div className="flex justify-between">
              <span className="text-outline">Customer:</span>
              <span className="font-bold text-on-surface">{placedOrder.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Email:</span>
              <span className="font-bold text-on-surface truncate max-w-[180px]">{placedOrder.customer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Phone:</span>
              <span className="font-bold text-on-surface">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Address:</span>
              <span className="font-bold text-on-surface truncate max-w-[180px]">{placedOrder.address}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-outline-variant/10">
              <span className="text-outline">Payment Method:</span>
              <span className="font-bold text-secondary">{placedOrder.paymentMethod}</span>
            </div>
          </div>

          <div className="text-left space-y-2">
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">Order Summary Items</h4>
            <div className="space-y-2 text-xs divide-y divide-outline-variant/10">
              {placedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-surface shrink-0 border border-outline-variant/30" />
                    <span className="font-bold text-on-surface truncate max-w-[140px] sm:max-w-[220px]">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-on-surface shrink-0">
                    {item.quantity} &times; ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
            <span className="text-xs sm:text-sm font-extrabold text-on-surface">Total Amount Paid:</span>
            <span className="text-lg sm:text-xl font-black text-secondary dark:text-secondary-fixed">
              ${placedOrder.total.toFixed(2)}
            </span>
          </div>

          <Link
            to="/products"
            className="inline-block w-full bg-secondary hover:bg-secondary-container text-white py-3 rounded-2xl font-extrabold text-xs transition shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow max-w-container-max w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-20 md:pb-8">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-fade-up">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700">
            <Icon name="info" className="text-secondary text-base" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="mb-3 flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-xs text-outline font-medium">
          <Link to="/" className="hover:text-secondary">
            Home
          </Link>
          <Icon name="chevron_right" className="text-xs text-outline" />
          <span className="text-on-surface font-semibold">Your Cart</span>
        </nav>
      </div>

      {/* Centered Page Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface text-center tracking-tight mb-4 sm:mb-8">
        Your Cart
      </h1>

      {/* 3-Step Checkout Progress Indicator */}
      <div className="flex items-center justify-center max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
        {/* Step 1: Information */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-md">
            1
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-on-surface">Information</span>
        </div>

        <div className="flex-grow h-0.5 bg-outline-variant/40 mx-2 sm:mx-8"></div>

        {/* Step 2: Delivery */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 opacity-40">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container dark:bg-slate-700 text-outline font-extrabold text-xs sm:text-sm flex items-center justify-center">
            2
          </div>
          <span className="text-xs sm:text-sm font-semibold text-outline">Delivery</span>
        </div>

        <div className="flex-grow h-0.5 bg-outline-variant/40 mx-2 sm:mx-8"></div>

        {/* Step 3: Payment */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 opacity-40">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container dark:bg-slate-700 text-outline font-extrabold text-xs sm:text-sm flex items-center justify-center">
            3
          </div>
          <span className="text-xs sm:text-sm font-semibold text-outline">Payment</span>
        </div>
      </div>

      {/* Urgency Countdown Banner */}
      <div className="max-w-container-max mx-auto bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 p-2.5 sm:p-3.5 rounded-xl mb-6 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs">
        <Icon name="error" className="text-base sm:text-lg text-amber-600 dark:text-amber-400" />
        <span>
          Cart items reserved for{" "}
          <span className="font-extrabold text-slate-900 dark:text-white underline font-mono">
            {formatTimer(secondsLeft)}
          </span>{" "}
          mins.
        </span>
      </div>

      {/* MAIN CHECKOUT FLOW VIEW */}
      {items.length === 0 ? (
        <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto border border-outline-variant/30 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-outline">
            <Icon name="shopping_cart_off" className="text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">Your Shopping Cart is Empty</h3>
          <p className="text-xs text-outline">
            Explore our catalog of flagship tech and luxury goods to populate your cart.
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold shadow-sm hover:bg-secondary-container transition"
          >
            Browse Products Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* MOBILE EXPANDABLE ORDER SUMMARY BAR */}
          <div className="lg:hidden w-full bg-surface-container-lowest dark:bg-slate-800 rounded-xl border border-outline-variant/30 p-3 shadow-xs">
            <button
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="w-full flex items-center justify-between text-xs font-bold text-on-surface"
            >
              <span className="flex items-center gap-1.5 text-secondary">
                <Icon name="shopping_bag" className="text-base" />
                <span>{isSummaryExpanded ? "Hide Order Summary" : "Show Order Summary"} ({getItemCount()})</span>
                <Icon name={isSummaryExpanded ? "expand_less" : "expand_more"} className="text-sm" />
              </span>
              <span className="text-sm font-black text-primary dark:text-white">${grandTotal.toFixed(2)}</span>
            </button>

            {isSummaryExpanded && (
              <div className="mt-3 pt-3 border-t border-outline-variant/20 space-y-2.5 animate-fade-up">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex items-center justify-between text-xs gap-2.5 bg-surface/50 dark:bg-slate-700/40 p-2 rounded-xl border border-outline-variant/20">
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 aspect-square object-cover rounded-lg bg-surface shrink-0 border border-outline-variant/30" />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-on-surface truncate block">{product.name}</span>
                      <span className="text-[10px] text-outline font-semibold uppercase">{product.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-on-surface block text-xs">{quantity} &times; ${product.price.toFixed(2)}</span>
                      <span className="text-[11px] text-secondary font-black">${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LEFT COLUMN: CART ITEM CARDS LIST & PRICE BREAKDOWN (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Header Counter */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h2 className="text-base sm:text-lg font-extrabold text-on-surface">Shopping Items</h2>
              <span className="text-xs font-extrabold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                {getItemCount()} Items
              </span>
            </div>

            {/* Dynamic Cart Items List (Compact, perfectly proportioned thumbnails) */}
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div
                  key={product._id}
                  className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs border border-outline-variant/30 flex flex-row items-center gap-3 sm:gap-4 group"
                >
                  {/* Perfect Fixed Thumbnail Box */}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 aspect-square object-cover rounded-xl bg-surface dark:bg-slate-700/50 shrink-0 border border-outline-variant/30"
                  />
                  <div className="flex-1 min-w-0 space-y-0.5 text-left">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary">
                      {product.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-on-surface truncate">{product.name}</h3>
                    <p className="text-xs font-extrabold text-primary dark:text-white">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="flex items-center border border-outline-variant/40 rounded-xl bg-surface dark:bg-slate-700/50 p-0.5 sm:p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                      >
                        <Icon name="remove" className="text-[11px] sm:text-xs" />
                      </button>
                      <span className="w-5 sm:w-6 text-center text-xs font-bold text-on-surface">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                      >
                        <Icon name="add" className="text-[11px] sm:text-xs" />
                      </button>
                    </div>

                    <span className="text-xs sm:text-sm font-black text-on-surface w-14 sm:w-16 text-right">
                      ${(product.price * quantity).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(product._id)}
                      className="p-1 sm:p-1.5 text-outline hover:text-error rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Remove Item"
                    >
                      <Icon name="delete" className="text-base" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Box */}
            <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs border border-outline-variant/30 space-y-2">
              <label className="block text-xs font-bold text-on-surface">Have a Discount Code?</label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Try 'LUMEN10'"
                  className="flex-grow bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none uppercase font-mono"
                />
                <button
                  type="submit"
                  className="bg-primary dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition"
                >
                  Apply
                </button>
              </form>
              {couponMessage && (
                <p
                  className={`text-[11px] font-bold mt-1 ${
                    couponMessage.isError ? "text-red-500" : "text-emerald-600"
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Order Summary Breakdown Card */}
            <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30 space-y-3">
              <h3 className="text-xs sm:text-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                Price Details
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-on-surface">${rawSubtotal.toFixed(2)}</span>
                </div>
                {appliedDiscountRate > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Savings (10%)</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-emerald-600">
                    {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Estimated Sales Tax (8%)</span>
                  <span className="font-bold text-on-surface">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="border-t border-outline-variant/30 pt-3 flex justify-between text-sm sm:text-base font-black text-on-surface">
                  <span>Total Payable Amount</span>
                  <span className="text-secondary dark:text-secondary-fixed">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EXPRESS CHECKOUT & CHECKOUT FORM (5 cols desktop) */}
          <div className="lg:col-span-5 space-y-5">
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* EXPRESS CHECKOUT SECTION */}
              <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/40 space-y-3.5">
                <div className="relative text-center">
                  <span className="bg-surface-container-lowest dark:bg-slate-800 px-3 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-outline">
                    Express Checkout
                  </span>
                  <div className="absolute inset-0 flex items-center -z-10">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                </div>

                {/* Express Buttons: Western Union, PayPal, GPay */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => showToast("Selected Western Union Express Checkout")}
                    className="bg-[#ffdd00] hover:brightness-95 text-black h-10 rounded-xl font-black text-[10px] sm:text-xs flex items-center justify-center px-1 transition shadow-xs"
                  >
                    <span className="tracking-tighter italic font-serif leading-tight text-center">
                      WESTERN
                      <br />
                      UNION
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast("Selected PayPal Express Checkout")}
                    className="bg-[#003087] hover:bg-[#002568] text-white h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition shadow-xs"
                  >
                    <span className="italic font-extrabold text-blue-300">Pay</span>
                    <span className="italic font-extrabold text-blue-100">Pal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast("Selected Google Pay Express Checkout")}
                    className="bg-black hover:bg-slate-900 text-white h-10 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1 transition shadow-xs"
                  >
                    <span className="font-bold text-white text-sm">G</span>
                    <span className="text-xs font-semibold text-slate-300">Pay</span>
                  </button>
                </div>

                {/* OR Divider */}
                <div className="relative text-center my-3">
                  <span className="bg-surface-container-lowest dark:bg-slate-800 px-3 text-xs font-bold text-outline">
                    OR
                  </span>
                  <div className="absolute inset-0 flex items-center -z-10">
                    <div className="w-full border-t border-outline-variant/30"></div>
                  </div>
                </div>

                {/* CONTACT SECTION */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-extrabold text-on-surface">Contact Information</h3>
                    <span className="text-[10px] text-outline flex items-center gap-1.5">
                      <span className="font-semibold text-on-surface-variant">Checkout as Guest</span>
                      <span className="text-outline-variant">|</span>
                      <Link to="/login" className="text-secondary font-bold hover:underline">
                        Log in
                      </Link>
                    </span>
                  </div>

                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Dezzlab.agency@gmail.com"
                      className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2.5 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={emailOffers}
                      onChange={(e) => setEmailOffers(e.target.checked)}
                      className="rounded border-outline-variant text-secondary focus:ring-secondary w-3.5 h-3.5"
                    />
                    <span>E-mail me with offers and news</span>
                  </label>
                </div>

                {/* DELIVERY LOCATION SECTION */}
                <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2.5">
                  <div className="relative text-center mb-2">
                    <span className="bg-surface-container-lowest dark:bg-slate-800 px-3 text-[10px] font-extrabold uppercase tracking-wider text-outline">
                      Delivery Method
                    </span>
                    <div className="absolute inset-0 flex items-center -z-10">
                      <div className="w-full border-t border-outline-variant/30"></div>
                    </div>
                  </div>

                  {/* Segmented Pill Toggle */}
                  <div className="bg-surface dark:bg-slate-700/60 p-1 rounded-xl grid grid-cols-2 gap-1 border border-outline-variant/30">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("home")}
                      className={`py-1.5 text-center rounded-lg text-xs font-bold transition ${
                        deliveryType === "home"
                          ? "bg-black dark:bg-white text-white dark:text-slate-900 shadow-xs"
                          : "text-outline hover:text-on-surface"
                      }`}
                    >
                      HOME DELIVERY
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("pickup")}
                      className={`py-1.5 text-center rounded-lg text-xs font-bold transition ${
                        deliveryType === "pickup"
                          ? "bg-black dark:bg-white text-white dark:text-slate-900 shadow-xs"
                          : "text-outline hover:text-on-surface"
                      }`}
                    >
                      DEZZ Pickup
                    </button>
                  </div>
                </div>

                {/* CUSTOMER INFORMATION SECTION */}
                <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-on-surface">Shipping Address</h3>

                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                      Country/Region*
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-semibold cursor-pointer"
                    >
                      <option value="US">New York (United States)</option>
                      <option value="PH">Philippines</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                        First Name*
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                      Address*
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAptField(!showAptField)}
                    className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
                  >
                    <span>{showAptField ? "- Hide apartment option" : "+ Add apartment, suite etc."}</span>
                  </button>

                  {showAptField && (
                    <div>
                      <input
                        type="text"
                        value={apt}
                        onChange={(e) => setApt(e.target.value)}
                        placeholder="Apartment, suite, unit (optional)"
                        className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                        City*
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                        State / Zip*
                      </label>
                      <input
                        type="text"
                        required
                        value={stateZip}
                        onChange={(e) => setStateZip(e.target.value)}
                        className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* PAYMENT METHOD OPTIONS */}
                <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-on-surface">Payment Method</h3>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash on Delivery")}
                      className={`flex flex-col justify-between p-2.5 rounded-xl border-2 cursor-pointer transition text-left ${
                        paymentMethod === "Cash on Delivery"
                          ? "border-secondary bg-secondary/5 dark:bg-slate-700/60"
                          : "border-outline-variant/30 hover:border-secondary/50 bg-surface dark:bg-slate-800"
                      }`}
                    >
                      <Icon name="local_atm" className="text-secondary text-lg" />
                      <span className="text-[10px] font-bold text-on-surface mt-1 block">COD</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("E-Wallet")}
                      className={`flex flex-col justify-between p-2.5 rounded-xl border-2 cursor-pointer transition text-left ${
                        paymentMethod === "E-Wallet"
                          ? "border-secondary bg-secondary/5 dark:bg-slate-700/60"
                          : "border-outline-variant/30 hover:border-secondary/50 bg-surface dark:bg-slate-800"
                      }`}
                    >
                      <Icon name="account_balance_wallet" className="text-blue-600 text-lg" />
                      <span className="text-[10px] font-bold text-on-surface mt-1 block">E-Wallet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Bank Transfer")}
                      className={`flex flex-col justify-between p-2.5 rounded-xl border-2 cursor-pointer transition text-left ${
                        paymentMethod === "Bank Transfer"
                          ? "border-secondary bg-secondary/5 dark:bg-slate-700/60"
                          : "border-outline-variant/30 hover:border-secondary/50 bg-surface dark:bg-slate-800"
                      }`}
                    >
                      <Icon name="account_balance" className="text-emerald-600 text-lg" />
                      <span className="text-[10px] font-bold text-on-surface mt-1 block">Bank</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-3 pt-3 border-t border-outline-variant/20">
                  <label className="block text-xs font-bold text-on-surface mb-1">Order Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Special delivery instructions..."
                    className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl p-2.5 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none"
                  ></textarea>
                </div>

                {/* Complete Order Action Button (Desktop View) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-secondary hover:bg-secondary-container text-white py-3.5 px-6 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="lock" className="text-base" />
                      <span>
                        Complete Order &bull; <span>${grandTotal.toFixed(2)}</span>
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERSISTENT STICKY BOTTOM SUBMIT BAR FOR MOBILE */}
      {items.length > 0 && !placedOrder && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/30 p-3 flex items-center justify-between lg:hidden shadow-2xl">
          <div>
            <span className="text-[10px] text-outline block leading-none">Total Payable</span>
            <span className="text-base font-black text-primary dark:text-white">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="py-2.5 px-6 rounded-xl bg-secondary text-white font-black text-xs shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <>
                <Icon name="lock" className="text-base" />
                <span>Place Order</span>
              </>
            )}
          </button>
        </div>
      )}
    </main>
  );
};
