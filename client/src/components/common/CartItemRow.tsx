import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { QuantityStepper } from "./QuantityStepper";
import { ProductImage } from "./ProductImage";
import type { CartItem } from "../../types";
import { formatMoney } from "../../utils/format";

// One line in the cart: image, name, quantity stepper (or read-only count), line total.
interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity?: (productId: string, qty: number) => void;
  onRemove?: (productId: string) => void;
  showLineTotal?: boolean;
}

export const CartItemRow = ({ item, onUpdateQuantity, onRemove, showLineTotal = true }: CartItemRowProps) => {
  const { product, quantity } = item;
  return (
    <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
      <ProductImage
        src={product.images[0]}
        alt={product.name}
        className="w-14 h-14 sm:w-16 sm:h-16 aspect-square object-cover rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 border border-outline-variant/30"
      />

      <div className="flex-1 min-w-0 space-y-0.5 text-left">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-secondary">
          {product.category}
        </span>
        <h3 className="text-xs sm:text-sm font-bold text-on-surface truncate">
          <Link to={`/product/${product._id}`} className="hover:text-secondary">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs font-extrabold text-primary dark:text-white">
          {formatMoney(product.price)}
        </p>
      </div>

      {onUpdateQuantity ? (
        <QuantityStepper
          value={quantity}
          onChange={(q) => onUpdateQuantity(product._id, q)}
          min={1}
          max={product.stock}
        />
      ) : (
        <span className="text-xs text-outline font-semibold">&times; {quantity}</span>
      )}

      <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
        {showLineTotal && (
          <span className="text-xs sm:text-sm font-black text-on-surface w-14 sm:w-16 text-right">
            {formatMoney(product.price * quantity)}
          </span>
        )}
        {onRemove && (
          <button
            onClick={() => onRemove(product._id)}
            className="text-outline hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            title="Remove item"
          >
            <Icon name="delete" className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
};
