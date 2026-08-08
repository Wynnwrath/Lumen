import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import { CartItemRow } from "../components/customer/cart/CartItemRow";
import { EmptyState } from "../components/ui/EmptyState";
import { calculateOrderTotals } from "../services/pricing";
import { formatMoney } from "../utils/format";

// Cart page: line items + order summary, then go to checkout.
export const CartPage = () => {
  const { items, getItemCount, updateQuantity, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  const itemCount = getItemCount();
  const totals = calculateOrderTotals(items, 0);
  const { subtotal, shippingFee, estimatedTax, grandTotal } = totals;

  if (items.length === 0) {
    return (
      <div className="max-w-container-max mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <EmptyState
          icon="shopping_cart"
          title="Your Cart is Currently Empty"
          subtitle="Looks like you haven't added any products to your shopping bag yet. Explore our catalog to find premium goods."
          action={
            <Link to="/products" className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary-container text-white font-extrabold text-xs shadow-md transition inline-flex items-center gap-2">
              <span>Start Shopping</span>
              <Icon name="arrow_forward" className="text-base" />
            </Link>
          }
        />
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
            {items.map((item) => (
              <CartItemRow
                key={item.product._id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
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

            {/* Summary Lines */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between font-semibold text-outline">
                <span>Items Subtotal ({itemCount})</span>
                <span className="text-on-surface font-bold">{formatMoney(subtotal)}</span>
              </div>

              <div className="flex justify-between font-semibold text-outline">
                <span>Shipping Fee</span>
                <span className="text-on-surface font-bold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    formatMoney(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between font-semibold text-outline">
                <span>Estimated Tax (8%)</span>
                <span className="text-on-surface font-bold">{formatMoney(estimatedTax)}</span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-black text-on-surface border-t border-outline-variant/20 pt-2.5">
                <span>Total Amount</span>
                <span className="text-secondary dark:text-secondary-fixed">
                  {formatMoney(grandTotal)}
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
