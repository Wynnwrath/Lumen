import { Link } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { Icon } from "../components/common/Icon";
import { QuantityStepper } from "../components/common/QuantityStepper";
import { EmptyState } from "../components/common/EmptyState";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { CheckoutSteps } from "./checkout/CheckoutSteps";
import { PromoCodeBox } from "./checkout/PromoCodeBox";
import { PaymentMethodSelector } from "./checkout/PaymentMethodSelector";
import { OrderConfirmationReceipt } from "./checkout/OrderConfirmationReceipt";
import { FormField } from "./checkout/FormField";

// Checkout: form + coupon + summary (state lives in useCheckoutForm), then receipt.
export const CheckoutPage = () => {
  const { items, getItemCount, updateQuantity, removeItem } = useCartStore();
  const {
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
    couponCode,
    setCouponCode,
    appliedDiscountRate,
    couponMessage,
    isSubmitting,
    placedOrder,
    handleApplyCoupon,
    handleSubmitOrder,
    rawSubtotal,
    discountAmount,
    shippingFee,
    estimatedTax,
    grandTotal,
  } = useCheckoutForm();

  // If Order Placed: Render Confirmation Receipt
  if (placedOrder) {
    return <OrderConfirmationReceipt order={placedOrder} phone={phone} />;
  }

  return (
    <main className="flex-grow max-w-container-max w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-20 lg:pb-8">
      {/* Toast Notification Container */}

      {/* Breadcrumb Navigation */}
      <div className="mb-3 flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-xs text-outline font-medium">
          <Link to="/" className="hover:text-secondary">
            Home
          </Link>
          <Icon name="chevron_right" className="text-xs text-outline" />
          <span className="text-on-surface font-semibold">Checkout</span>
        </nav>
      </div>

      {/* Centered Page Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface text-center tracking-tight mb-4 sm:mb-8">
        Checkout
      </h1>

      {/* 3-Step Checkout Progress Indicator */}
      <CheckoutSteps />

      {/* MAIN CHECKOUT FLOW VIEW */}
      {items.length === 0 ? (
          <EmptyState
            icon="shopping_cart_off"
            title="Your Shopping Cart is Empty"
            subtitle="Explore our catalog of flagship tech and luxury goods to populate your cart."
            action={
              <Link to="/products" className="inline-block px-5 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold shadow-sm hover:bg-secondary-container transition">
                Browse Products Catalog
              </Link>
            }
            className="max-w-lg mx-auto"
          />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

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
                    <QuantityStepper value={quantity} onChange={(q) => updateQuantity(product._id, q)} min={1} max={product.stock} />

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
            <PromoCodeBox
              couponCode={couponCode}
              onCouponChange={setCouponCode}
              onApply={handleApplyCoupon}
              message={couponMessage}
            />

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
                    <span>Coupon Savings ({Math.round(appliedDiscountRate * 100)}%)</span>
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

          {/* RIGHT COLUMN: CHECKOUT FORM (5 cols desktop) */}
          <div className="lg:col-span-5 space-y-5">
            <form onSubmit={handleSubmitOrder} className="space-y-5">
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
                      STORE PICKUP
                    </button>
                  </div>                </div>

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
                      <option value="PH">Manila (Philippines)</option>
                      <option value="US">New York (United States)</option>
                      <option value="CA">Toronto (Canada)</option>
                      <option value="UK">London (United Kingdom)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="First Name*" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    <FormField label="Last Name*" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>

                  <FormField label="Address*" value={address} onChange={(e) => setAddress(e.target.value)} required />

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
                    <FormField label="City*" value={city} onChange={(e) => setCity(e.target.value)} required />
                    <FormField label="State / Zip*" value={stateZip} onChange={(e) => setStateZip(e.target.value)} required />
                  </div>

                  <FormField label="Phone Number*" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                {/* PAYMENT METHOD OPTIONS */}
                <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-on-surface">Payment Method</h3>

                  <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
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
            </form>
          </div>
        </div>
      )}

      {/* PERSISTENT STICKY BOTTOM SUBMIT BAR FOR MOBILE */}
      {items.length > 0 && !placedOrder && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/30 p-3 flex items-center justify-between lg:hidden shadow-2xl">
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
