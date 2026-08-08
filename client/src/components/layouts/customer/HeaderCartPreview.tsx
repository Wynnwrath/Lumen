import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../../stores/cart.store";
import { Icon } from "../../ui/Icon";
import { CartItemRow } from "../../customer/cart/CartItemRow";
import { formatMoney } from "../../../utils/format";
import { useClickOutside } from "../../../hooks/useClickOutside";

// Desktop cart icon with a hover quick-preview panel (items, subtotal, checkout).
export const HeaderCartPreview = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getItemCount, removeItem } = useCartStore();

  const [showCartModal, setShowCartModal] = useState(false);
  const cartModalRef = useRef<HTMLDivElement>(null);

  // close the dropdown when clicking outside
  useClickOutside(cartModalRef, () => setShowCartModal(false));

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  return (
    <div
      className="hidden md:block relative"
      ref={cartModalRef}
      onMouseEnter={() => setShowCartModal(true)}
      onMouseLeave={() => setShowCartModal(false)}
    >
      <Link
        to="/cart"
        className="text-primary dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 p-2.5 rounded-full relative transition-all flex items-center justify-center"
        title="Shopping Cart"
      >
        <Icon name="shopping_cart" />
        {itemCount > 0 && (
          <span className="absolute top-0 right-0 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </Link>

      {/* Cart Quick Preview Dropdown */}
      {showCartModal && (
        <div className="absolute top-full right-0 pt-1 z-50">
          <div className="w-[320px] bg-surface-container-lowest dark:bg-slate-900 rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5 gap-2">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider whitespace-nowrap">
                Cart Quick Preview
              </span>
              <span className="text-xs font-extrabold text-secondary whitespace-nowrap">{itemCount} Items</span>
            </div>

            {/* Mini List or Empty State */}
            {items.length === 0 ? (
              <div className="py-6 px-4 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <Icon name="shopping_bag" className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-on-surface">Your cart is empty</p>
                  <p className="text-xs text-outline">Looks like you haven&apos;t added anything yet.</p>
                </div>
                <button
                  onClick={() => {
                    setShowCartModal(false);
                    navigate("/products");
                  }}
                  className="w-full mt-2 bg-secondary hover:bg-secondary-container text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>Browse Catalog</span>
                  <Icon name="arrow_forward" className="text-sm" />
                </button>
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {items.map((item) => (
                    <CartItemRow key={item.product._id} item={item} variant="compact" onRemove={removeItem} />
                  ))}
                </div>

                <div className="border-t border-outline-variant/20 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                    <span>Subtotal:</span>
                    <span className="font-bold text-on-surface">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-on-surface">
                    <span>Total Amount:</span>
                    <span className="text-secondary dark:text-secondary-fixed">
                      {formatMoney(subtotal)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowCartModal(false);
                      navigate("/checkout");
                    }}
                    className="w-full mt-2 bg-secondary hover:bg-secondary-container text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Checkout</span>
                    <Icon name="arrow_forward" className="text-sm" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
