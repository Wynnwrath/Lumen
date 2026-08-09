import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cart.store";
import { Icon } from "../components/ui/Icon";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { CartItemRow } from "../components/customer/cart/CartItemRow";
import { EmptyState } from "../components/ui/EmptyState";
import { PriceSummary } from "../components/customer/checkout/PriceSummary";
import { calculateOrderTotals } from "../services/pricing";

// Cart page: line items + order summary, then go to checkout.
export const CartPage = () => {
  const { items, getItemCount, updateQuantity, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const itemCount = getItemCount();
  const totals = calculateOrderTotals(items, 0);
  const { subtotal, shippingFee, estimatedTax, grandTotal } = totals;

  if (items.length === 0) {
    return (
      <div className="h-full min-h-0 w-full max-w-container-max mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-y-auto flex items-center justify-center">
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
    <div className="h-full min-h-0 flex flex-col w-full max-w-container-max mx-auto px-3 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-3 shrink-0">
        <div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-on-surface">Shopping Cart</h1>
          <p className="text-xs text-outline mt-0.5 font-medium hidden sm:block">
            Review your selected items and configure your order summary before checkout.
          </p>
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 shrink-0"
        >
          <Icon name="delete_sweep" className="text-sm" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Main Grid: only the product list scrolls; summary stays fixed */}
      <div className="flex-1 min-h-0 mt-5 sm:mt-8 overflow-y-auto lg:overflow-hidden pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start lg:h-full">
          {/* Left Column: Cart Items List (the scrollable area) */}
          <div className="lg:col-span-8 max-h-[55vh] lg:max-h-none lg:h-full lg:min-h-0 lg:overflow-y-auto space-y-3 pr-1">
            <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl border border-outline-variant/30 divide-y divide-outline-variant/10 overflow-hidden shadow-xs">
              {items.map((item) => (
                <CartItemRow
                  key={item.product.id}
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

          {/* Right Column: Order Summary Box (always visible while items scroll) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-surface-container-lowest dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-outline-variant/30 space-y-4 shadow-xs">
              <h2 className="text-xs sm:text-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                Order Summary
              </h2>

            {/* Summary Lines */}
            <p className="text-[11px] font-bold text-outline uppercase tracking-wider">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            <PriceSummary
              subtotal={subtotal}
              discountAmount={0}
              appliedDiscountRate={0}
              shippingFee={shippingFee}
              estimatedTax={estimatedTax}
              grandTotal={grandTotal}
            />

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

      {/* Styled Clear Cart Confirmation */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear Your Cart?"
        icon={<Icon name="warning" className="text-3xl text-amber-600" />}
        headerIconClassName="bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-full w-14 h-14"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="dark"
              onClick={() => {
                clearCart();
                setShowClearConfirm(false);
              }}
            >
              Clear Cart
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          This will remove all {itemCount} {itemCount === 1 ? "item" : "items"} from your cart. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
