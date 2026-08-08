import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { useAuthStore } from "../stores/auth.store";
import { Icon } from "../components/ui/Icon";
import { ProductImage } from "../components/ui/ProductImage";
import { QuantityStepper } from "../components/customer/cart/QuantityStepper";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { CheckoutSteps } from "../components/customer/checkout/CheckoutSteps";
import { PromoCodeBox } from "../components/customer/checkout/PromoCodeBox";
import { PaymentMethodSelector } from "../components/customer/checkout/PaymentMethodSelector";
import { OrderConfirmationReceipt } from "../components/customer/checkout/OrderConfirmationReceipt";
import { PriceSummary } from "../components/customer/checkout/PriceSummary";
import { FormField } from "../components/ui/FormField";
import { formatMoney } from "../utils/format";
import { isValidPhone, PHONE_PATTERN } from "../utils/validation";

// Checkout in 3 steps: Review (items + coupon + totals) -> Details (form) -> Confirmation.
export const CheckoutPage = () => {
  const { items, getItemCount, updateQuantity, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const [phoneError, setPhoneError] = useState("");
  const {
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
    couponCode,
    setCouponCode,
    appliedDiscountRate,
    couponMessage,
    isSubmitting,
    placedOrder,
    handleApplyCoupon,
    handleSubmitOrder,
    currentStep,
    nextStep,
    prevStep,
    subtotalBeforeDiscount,
    discountAmount,
    shippingFee,
    estimatedTax,
    grandTotal,
  } = useCheckoutForm();

  // Order placed -> show the receipt.
  if (placedOrder) {
    return <OrderConfirmationReceipt order={placedOrder} phone={phone} />;
  }

  // Checkout requires a signed-in customer. Gate at entry so nobody fills the
  // whole form only to get bounced (and lose their input) at submit time.
  if (!user && items.length > 0) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  return (
    <main className="h-full min-h-0 flex flex-col w-full max-w-container-max mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-4 sm:pb-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-3 flex items-center justify-between shrink-0">
        <nav className="flex items-center gap-1.5 text-xs text-outline font-medium">
          <Link to="/" className="hover:text-secondary">
            Home
          </Link>
          <Icon name="chevron_right" className="text-xs text-outline" />
          <span className="text-on-surface font-semibold">Checkout</span>
        </nav>
      </div>

      {/* Centered Page Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface text-center tracking-tight mb-4 sm:mb-8 shrink-0">
        Checkout
      </h1>

      {items.length === 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
          <EmptyState
            icon="shopping_cart_off"
            title="Your Shopping Cart is Empty"
            subtitle="Explore our catalog of flagship tech and luxury goods to populate your cart."
            action={
              <Link
                to="/products"
                className="inline-block px-5 py-2.5 rounded-xl bg-secondary text-white text-xs font-bold shadow-sm hover:bg-secondary-container transition"
              >
                Browse Products Catalog
              </Link>
            }
            className="max-w-lg mx-auto py-10"
          />
        </div>
      ) : (
        <>
          <div className="shrink-0">
            <CheckoutSteps currentStep={currentStep} />
          </div>

          {/* Step area: each step manages its own internal scrolling */}
          <div className="flex-1 min-h-0">

            {/* STEP 1 — REVIEW */}
            {currentStep === 1 && (
              <div className="h-full min-h-0 overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-12 lg:gap-6 pb-24 lg:pb-0">
                <div className="lg:col-span-8 lg:h-full lg:min-h-0 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 shrink-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-on-surface">Shopping Items</h2>
                    <span className="text-xs font-extrabold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                      {getItemCount()} Items
                    </span>
                  </div>

                  {/* Products list scrolls internally (like admin tables) */}
                  <div className="space-y-3 mt-3 max-h-[45vh] lg:max-h-none lg:flex-1 lg:min-h-0 lg:overflow-y-auto pr-1">
                    {items.map(({ product, quantity }) => (
                      <div
                        key={product._id}
                        className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs border border-outline-variant/30 flex items-center gap-3 sm:gap-4"
                      >
                        <ProductImage
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
                            {formatMoney(product.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <QuantityStepper value={quantity} onChange={(q) => updateQuantity(product._id, q)} min={1} max={product.stock} />
                          <span className="text-xs sm:text-sm font-black text-on-surface w-14 sm:w-16 text-right">
                            {formatMoney(product.price * quantity)}
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
                </div>

                {/* Fixed right rail: coupon, totals, continue */}
                <div className="mt-5 lg:mt-0 lg:col-span-4 space-y-5 shrink-0">
                  <PromoCodeBox
                    couponCode={couponCode}
                    onCouponChange={setCouponCode}
                    onApply={handleApplyCoupon}
                    message={couponMessage}
                  />

                  <PriceSummary
                    subtotal={subtotalBeforeDiscount}
                    discountAmount={discountAmount}
                    appliedDiscountRate={appliedDiscountRate}
                    shippingFee={shippingFee}
                    estimatedTax={estimatedTax}
                    grandTotal={grandTotal}
                  />

                  <div className="flex justify-end hidden lg:flex">
                    <Button icon="arrow_forward" onClick={nextStep}>
                      Continue to Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — DETAILS FORM */}
            {currentStep === 2 && (
              <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden scroll-pl-2 pb-24 lg:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-6 items-start pl-1">
                  <form id="checkout-form" onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-5">
                    <div className="space-y-2.5">
                      <h3 className="text-xs sm:text-sm font-extrabold text-on-surface">Contact Information</h3>

                      <div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-white dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2.5 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
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

                    <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2.5">
                      <h3 className="text-xs sm:text-sm font-extrabold text-on-surface">Shipping Address</h3>

                      <div>
                        <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                          Country/Region*
                        </label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-white dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-semibold cursor-pointer"
                        >
                          <option value="Metro Manila">Metro Manila (Philippines)</option>
                          <option value="Cordillera Administrative Region">Cordillera Administrative Region (CAR)</option>
                          <option value="Ilocos Region">Ilocos Region (Region I)</option>
                          <option value="Cagayan Valley">Cagayan Valley (Region II)</option>
                          <option value="Central Luzon">Central Luzon (Region III)</option>
                          <option value="CALABARZON">CALABARZON (Region IV-A)</option>
                          <option value="MIMAROPA">MIMAROPA (Region IV-B)</option>
                          <option value="Bicol Region">Bicol Region (Region V)</option>
                          <option value="Western Visayas">Western Visayas (Region VI)</option>
                          <option value="Central Visayas">Central Visayas (Region VII)</option>
                          <option value="Eastern Visayas">Eastern Visayas (Region VIII)</option>
                          <option value="Zamboanga Peninsula">Zamboanga Peninsula (Region IX)</option>
                          <option value="Northern Mindanao">Northern Mindanao (Region X)</option>
                          <option value="Davao Region">Davao Region (Region XI)</option>
                          <option value="SOCCSKSARGEN">SOCCSKSARGEN (Region XII)</option>
                          <option value="Caraga">Caraga (Region XIII)</option>
                          <option value="Bangsamoro Autonomous Region">Bangsamoro Autonomous Region (BARMM)</option>
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
                            className="w-full bg-white dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <FormField label="City*" value={city} onChange={(e) => setCity(e.target.value)} required />
                        <FormField label="State / Zip*" value={stateZip} onChange={(e) => setStateZip(e.target.value)} required />
                      </div>

                      <FormField
                        label="Phone Number*"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (phoneError) setPhoneError("");
                        }}
                        onBlur={() => setPhoneError(isValidPhone(phone) ? "" : "Enter a valid phone number (e.g. 0917 123 4567)")}
                        required
                        pattern={PHONE_PATTERN}
                        error={phoneError}
                      />
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2.5">
                      <h3 className="text-xs sm:text-sm font-extrabold text-on-surface">Payment Method</h3>
                      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                    </div>

                    <div className="mt-3 pt-3 border-t border-outline-variant/20">
                      <label className="block text-xs font-bold text-on-surface mb-1">Order Notes (Optional)</label>
                      <textarea
                        rows={2}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Special delivery instructions..."
                        className="w-full bg-white dark:bg-slate-700/60 text-on-surface text-xs rounded-xl p-2.5 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="flex items-center justify-between gap-3 hidden lg:flex">
                      <Button variant="outline" icon="arrow_back" onClick={prevStep}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </form>

                  {/* Persistent order summary so shoppers keep sight of what they're buying */}
                  <aside className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
                    <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30 space-y-3">
                      <h3 className="text-xs sm:text-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                        Order Summary
                      </h3>
                      <div className="space-y-2.5">
                        {items.map(({ product, quantity }) => (
                          <div key={product._id} className="flex items-center gap-3">
                            <ProductImage
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg bg-surface dark:bg-slate-700/50 shrink-0 border border-outline-variant/30"
                            />
                            <span className="text-xs font-semibold text-on-surface truncate flex-1 min-w-0">
                              {product.name}
                            </span>
                            <span className="text-xs text-outline shrink-0">&times; {quantity}</span>
                            <span className="font-mono font-bold text-xs text-on-surface shrink-0 w-16 text-right">
                              {formatMoney(product.price * quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <PriceSummary
                      subtotal={subtotalBeforeDiscount}
                      discountAmount={discountAmount}
                      appliedDiscountRate={appliedDiscountRate}
                      shippingFee={shippingFee}
                      estimatedTax={estimatedTax}
                      grandTotal={grandTotal}
                    />
                  </aside>
                </div>
              </div>
            )}

            {/* STEP 3 — PLACING YOUR ORDER */}
            {currentStep === 3 && (
              <div className="h-full min-h-0 overflow-y-auto flex items-center justify-center pb-24 lg:pb-0">
                <div className="max-w-md mx-auto text-center space-y-4 py-16 animate-fade-up">
                  <div className="w-12 h-12 mx-auto border-4 border-outline-variant border-t-secondary rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-on-surface">Placing your order...</p>
                  <p className="text-xs text-outline">Please wait while we confirm your order.</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* MOBILE STICKY BAR */}
      {items.length > 0 && currentStep < 3 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/30 p-3 flex items-center justify-between lg:hidden shadow-2xl pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div>
            <span className="text-[10px] text-outline block leading-none">Total Payable</span>
            <span className="text-base font-black text-primary dark:text-white">
              {formatMoney(grandTotal)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-bold text-xs"
              >
                Back
              </button>
            )}
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="py-2.5 px-6 rounded-xl bg-secondary text-white font-black text-xs shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span>Continue</span>
                <Icon name="arrow_forward" className="text-sm" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="py-2.5 px-6 rounded-xl bg-secondary text-white font-black text-xs shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <span>Place Order</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
