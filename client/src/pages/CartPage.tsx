import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { Icon } from "../components/common/Icon";
import { Button } from "../components/common/Button";
import { QuantityStepper } from "../components/common/QuantityStepper";

export const CartPage = () => {
  const { items, getSubtotal, getItemCount, updateQuantity, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const discountAmount = (subtotal * appliedDiscountPercent) / 100;
  const shippingFee = subtotal > 100 || items.length === 0 ? 0 : 15.0;
  const estimatedTax = (subtotal - discountAmount) * 0.08;
  const grandTotal = subtotal - discountAmount + shippingFee + estimatedTax;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const code = couponCode.trim().toUpperCase();
    if (code === "LUMEN10" || code === "WELCOME10") {
      setAppliedDiscountPercent(10);
      setCouponSuccess("10% discount coupon applied successfully!");
    } else if (code === "PRO20") {
      setAppliedDiscountPercent(20);
      setCouponSuccess("20% PRO discount applied!");
    } else {
      setCouponError("Invalid promo code. Try 'LUMEN10' or 'PRO20'");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center space-y-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-outline">
          <Icon name="shopping_cart" className="text-3xl sm:text-4xl" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-3xl font-black text-on-surface">Your Cart is Currently Empty</h1>
          <p className="text-xs text-outline max-w-sm mx-auto">
            Looks like you haven't added any products to your shopping bag yet. Explore our catalog to find premium goods.
          </p>
        </div>
        <div>
          <Link
            to="/products"
            className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary-container text-white font-extrabold text-xs shadow-md transition inline-flex items-center gap-2"
          >
            <span>Start Shopping</span>
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-on-surface">Shopping Cart</h1>
          <p className="text-xs text-outline mt-0.5 font-medium hidden sm:block">
            Review your selected items and configure your order summary before checkout.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all items from your cart?")) {
              clearCart();
            }
          }}
          className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 shrink-0"
        >
          <Icon name="delete_sweep" className="text-sm" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Main Grid: Item List + Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl border border-outline-variant/30 divide-y divide-outline-variant/10 overflow-hidden shadow-xs">
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="p-3 sm:p-4 flex flex-row items-center gap-3 sm:gap-4">
                {/* Compact 1:1 Square Thumbnail */}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 aspect-square object-cover rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 border border-outline-variant/30"
                />

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-0.5 text-left">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary">
                    {product.brand || product.category}
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-on-surface truncate">
                    <Link to={`/product/${product._id}`} className="hover:text-secondary">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-outline font-semibold">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <QuantityStepper value={quantity} onChange={(q) => updateQuantity(product._id, q)} min={1} max={product.stock} />

                {/* Subtotal & Delete */}
                <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
                  <span className="text-xs sm:text-sm font-black text-on-surface w-14 sm:w-16 text-right">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(product._id)}
                    className="text-outline hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    title="Remove item"
                  >
                    <Icon name="delete" className="text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline pt-1"
          >
            <Icon name="arrow_back" className="text-sm" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Right Column: Order Summary Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-outline-variant/30 space-y-4 shadow-xs">
            <h2 className="text-xs sm:text-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
              Order Summary
            </h2>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-on-surface">Have a Promo Code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. LUMEN10"
                  className="w-full bg-surface dark:bg-slate-800 border border-outline-variant/40 rounded-xl px-3 py-2 text-xs uppercase font-mono outline-none focus:border-secondary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shrink-0 hover:opacity-90 transition"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[11px] font-semibold text-red-500">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] font-semibold text-emerald-500">{couponSuccess}</p>}
            </form>

            {/* Summary Lines */}
            <div className="space-y-2 text-xs border-t border-outline-variant/20 pt-3">
              <div className="flex justify-between font-semibold text-outline">
                <span>Items Subtotal ({itemCount})</span>
                <span className="text-on-surface font-bold">${subtotal.toFixed(2)}</span>
              </div>

              {appliedDiscountPercent > 0 && (
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Discount ({appliedDiscountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-outline">
                <span>Shipping Fee</span>
                <span className="text-on-surface font-bold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between font-semibold text-outline">
                <span>Estimated Tax (8%)</span>
                <span className="text-on-surface font-bold">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-black text-on-surface border-t border-outline-variant/20 pt-2.5">
                <span>Total Amount</span>
                <span className="text-secondary dark:text-secondary-fixed">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Button fullWidth icon="arrow_forward" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </Button>

            {/* Guarantees */}
            <div className="pt-2 border-t border-outline-variant/10 text-[11px] text-outline space-y-1.5">
              <div className="flex items-center gap-2">
                <Icon name="lock" className="text-emerald-500 text-sm" />
                <span>256-bit SSL Encrypted Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="verified" className="text-blue-500 text-sm" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
