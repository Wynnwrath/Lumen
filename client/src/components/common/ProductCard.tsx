import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../../types";
import { useWishlistStore } from "../../stores/wishlist.store";
import { Icon } from "./Icon";
import { ProductImage } from "./ProductImage";
import { formatMoney } from "../../utils/format";

// tracks the mouse so the spotlight glow follows the cursor
export const trackSpotlight = (e: React.MouseEvent<HTMLDivElement>) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
  card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
};

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list" | "compact";
  onAddToCart?: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard = ({ product, variant = "grid", onAddToCart }: ProductCardProps) => {
  const navigate = useNavigate();
  const { ids, toggle } = useWishlistStore();
  const isWishlisted = ids.includes(product._id);
  const isOutOfStock = product.stock <= 0;

  // the little status pill in the top-left corner
  let statusBadge: React.ReactNode = null;
  if (isOutOfStock) {
    statusBadge = <span className="bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Out of Stock</span>;
  } else if (product.stock <= 3) {
    statusBadge = <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Only {product.stock} Left</span>;
  } else if (product.arrival) {
    statusBadge = <span className="bg-secondary-container text-on-secondary-container text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">New</span>;
  } else if (product.isSale) {
    statusBadge = <span className="bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Sale</span>;
  }

  const wishlistButton = (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(product._id); }}
      className="absolute top-2 right-2 z-10 text-outline hover:text-red-500 transition-all bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full p-1 sm:p-1.5 shadow-xs hover:scale-110"
      title="Wishlist"
    >
      <Icon name="favorite" filled={isWishlisted} className={`text-base sm:text-lg ${isWishlisted ? "text-red-500" : ""}`} />
    </button>
  );

  const ratingRow = (
    <div className="flex items-center gap-1 mt-0.5">
      <Icon name="star" filled className="text-xs sm:text-sm text-amber-400" />
      <span className="text-[10px] sm:text-xs font-bold text-on-surface">{product.rating}</span>
      <span className="text-[10px] sm:text-xs text-outline font-medium">({product.reviewsCount})</span>
    </div>
  );

  const priceRow = (
    <div className="pt-1.5 flex items-center justify-between border-t border-outline-variant/20">
      <div>
        <span className="text-xs sm:text-base font-extrabold text-primary dark:text-white">{formatMoney(product.price)}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-[10px] sm:text-xs text-outline line-through ml-1 hidden sm:inline">{formatMoney(product.originalPrice)}</span>
        )}
      </div>
      {onAddToCart && (
        <button
          onClick={(e) => onAddToCart(product, e)}
          disabled={isOutOfStock}
          className={`bg-secondary hover:bg-secondary-container ${isOutOfStock ? "opacity-40 cursor-not-allowed" : ""} text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all active:scale-95 shadow-sm flex items-center gap-1 text-[11px] font-bold`}
          title="Add to Cart"
        >
          <Icon name="add_shopping_cart" className="text-sm sm:text-base" />
          <span className="hidden sm:inline">Add</span>
        </button>
      )}
    </div>
  );

  // horizontal list card (whole row is clickable)
  if (variant === "list") {
    return (
      <div
        onMouseMove={trackSpotlight}
        onClick={() => navigate(`/product/${product._id}`)}
        className="product-card spotlight-card bg-surface-container-lowest dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-outline-variant/30 p-3 sm:p-4 shadow-xs hover:shadow-lg transition-all flex flex-row items-center gap-3 sm:gap-4 group cursor-pointer"
      >
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="w-20 h-20 sm:w-32 sm:h-32 object-cover rounded-xl bg-slate-100 dark:bg-slate-700/50 shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-secondary">{product.category}</span>
            <button
              onClick={(e) => { e.stopPropagation(); toggle(product._id); }}
              className="text-outline hover:text-red-500"
            >
              <Icon name="favorite" filled={isWishlisted} className={`text-base sm:text-lg ${isWishlisted ? "text-red-500" : ""}`} />
            </button>
          </div>
          <Link to={`/product/${product._id}`} onClick={(e) => e.stopPropagation()} className="font-bold text-xs sm:text-base text-on-surface group-hover:text-secondary transition-colors block line-clamp-1">
            {product.name}
          </Link>
          <p className="text-[11px] text-outline line-clamp-1 font-normal hidden sm:block">{product.description}</p>
          {ratingRow}
        </div>
        <div className="flex flex-col items-end justify-between shrink-0 gap-2">
          <span className="text-sm sm:text-xl font-extrabold text-on-surface block">{formatMoney(product.price)}</span>
          {onAddToCart && (
            <button
              onClick={(e) => onAddToCart(product, e)}
              disabled={isOutOfStock}
              className={`p-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                isOutOfStock
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-secondary hover:bg-secondary-container text-white shadow-xs"
              }`}
            >
              <Icon name="add_shopping_cart" className="text-sm" />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // compact card used for "related products"
  if (variant === "compact") {
    return (
      <div className="product-card bg-surface-container-lowest dark:bg-slate-800 rounded-xl sm:rounded-none shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group border border-outline-variant/30 overflow-hidden">
        <div className="relative w-full aspect-square bg-surface-container dark:bg-slate-700/50 overflow-hidden">
          <Link to={`/product/${product._id}`} className="w-full h-full block">
            <ProductImage src={product.images[0]} alt={product.name} className="product-card-img object-cover h-full w-full group-hover:scale-105 transition-transform duration-300" />
          </Link>
        </div>
        <div className="p-2.5 sm:p-4 flex-grow flex flex-col justify-between space-y-1.5 sm:space-y-2">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-secondary">{product.category}</span>
            <Link to={`/product/${product._id}`} className="text-xs sm:text-sm font-bold text-on-surface line-clamp-2 leading-tight sm:leading-snug hover:text-secondary transition-colors block mt-0.5">{product.name}</Link>
          </div>
          <div className="pt-1.5 flex items-center justify-between border-t border-outline-variant/20">
            <span className="text-xs sm:text-sm font-extrabold text-primary dark:text-white">{formatMoney(product.price)}</span>
            <Link to={`/product/${product._id}`} className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-white px-2 py-1 rounded-lg text-xs font-bold transition">View</Link>
          </div>
        </div>
      </div>
    );
  }

  // default: standard grid card
  return (
    <div
      onMouseMove={trackSpotlight}
      className="product-card spotlight-card bg-surface-container-lowest dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative border border-outline-variant/30 overflow-hidden"
    >
      <div className="relative w-full aspect-square bg-surface-container dark:bg-slate-700/50 overflow-hidden">
        <Link to={`/product/${product._id}`} className="w-full h-full block">
          <ProductImage src={product.images[0]} alt={product.name} className="product-card-img object-cover h-full w-full group-hover:scale-105 transition-transform duration-300" />
        </Link>
        <div className="absolute top-2 left-2 z-10">{statusBadge}</div>
        {wishlistButton}
      </div>
      <div className="p-2.5 sm:p-4 flex-grow flex flex-col justify-between space-y-1.5 sm:space-y-2">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-secondary">{product.category}</span>
          <Link to={`/product/${product._id}`} className="text-xs sm:text-base font-bold text-on-surface line-clamp-2 leading-tight sm:leading-snug hover:text-secondary transition-colors block mt-0.5">{product.name}</Link>
          {ratingRow}
        </div>
        {priceRow}
      </div>
    </div>
  );
};
