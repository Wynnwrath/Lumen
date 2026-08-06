import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { dataService } from "../services/dataService";
import { useCartStore } from "../stores/cart.store";
import { useWishlistStore } from "../stores/wishlist.store";
import { Icon } from "../components/common/Icon";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlistStore();

  const product = dataService.getProductById(id || "p1");
  const allProducts = dataService.getProducts();

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: string } | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Normalize images array
  const images = product?.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"];

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setIsZoomOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-container-max mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-on-surface">Product Not Found</h2>
        <p className="text-xs text-outline">The requested product could not be located in our catalog.</p>
        <Link to="/products" className="px-5 py-2.5 bg-secondary text-white text-xs font-bold rounded-xl inline-block shadow-md hover:bg-secondary-container transition">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(product._id);
  const isOutOfStock = product.stock <= 0;
  const currentImage = images[selectedImageIndex] || images[0];

  // Calculate discount percentage
  const discountPct = (product.originalPrice && product.originalPrice > product.price)
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Related products in same category
  const relatedProducts = allProducts.filter((p) => p.category === product.category && p._id !== product._id).slice(0, 4);

  const showToast = (text: string, type = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    } else if (newQty > product.stock) {
      showToast(`Only ${product.stock} units available in stock!`, "info");
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    showToast(`Added ${quantity} &times; "${product.name}" to cart!`, "cart");
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    navigate("/checkout");
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product._id);
    const nowSaved = !isWishlisted;
    showToast(nowSaved ? "Saved to wishlist!" : "Removed from wishlist", nowSaved ? "wishlist" : "info");
  };

  return (
    <div className="max-w-container-max mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 flex-grow w-full pb-24 md:pb-8">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-fade-up">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold max-w-sm border ${
            toastMessage.type === "cart" 
              ? "bg-secondary text-white border-secondary-container"
              : toastMessage.type === "wishlist"
              ? "bg-pink-600 text-white border-pink-700"
              : "bg-slate-900 text-white border-slate-700"
          }`}>
            <Icon name={toastMessage.type === "cart" ? "check_circle" : toastMessage.type === "wishlist" ? "favorite" : "info"} className="text-base" />
            <span dangerouslySetInnerHTML={{ __html: toastMessage.text }}></span>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-outline overflow-x-auto whitespace-nowrap hide-scroll">
        <Link to="/" className="hover:text-secondary transition">Home</Link>
        <Icon name="chevron_right" className="text-xs" />
        <Link to="/products" className="hover:text-secondary transition">Catalog</Link>
        <Icon name="chevron_right" className="text-xs" />
        <Link to={`/products?category=${product.category}`} className="hover:text-secondary transition capitalize">
          {product.category}
        </Link>
        <Icon name="chevron_right" className="text-xs" />
        <span className="font-semibold text-on-surface truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Product Detail Two-Column Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-3">
          {/* Main Display Image Frame */}
          <div className="aspect-square max-h-[320px] sm:max-h-none mx-auto w-full rounded-none bg-surface-container dark:bg-slate-800 overflow-hidden border border-outline-variant/30 shadow-md relative group">
            <img
              src={currentImage}
              alt={product.name}
              onClick={() => setIsZoomOpen(true)}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 cursor-zoom-in"
            />
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-3 right-3 bg-white/80 dark:bg-slate-900/80 p-2 rounded-full backdrop-blur-md shadow-sm text-on-surface hover:text-secondary transition"
              title="Zoom Image"
            >
              <Icon name="zoom_in" className="text-base sm:text-lg" />
            </button>
          </div>

          {/* Thumbnail Gallery Carousel */}
          {images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 hide-scroll">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-none overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-secondary opacity-100 scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-secondary/10 text-secondary text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-xs text-outline font-semibold">By {product.brand || "Lumen"}</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-on-surface leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400 text-xs sm:text-sm">
                <Icon name="star" className="text-sm sm:text-base" filled />
                <Icon name="star" className="text-sm sm:text-base" filled />
                <Icon name="star" className="text-sm sm:text-base" filled />
                <Icon name="star" className="text-sm sm:text-base" filled />
                <Icon name="star_half" className="text-sm sm:text-base" filled />
              </div>
              <span className="text-xs sm:text-sm font-bold text-on-surface">{product.rating || 4.9}</span>
              <a href="#reviews" className="text-[11px] sm:text-xs font-semibold text-secondary hover:underline">
                ({(product.reviewsCount || 1420).toLocaleString()} reviews)
              </a>
            </div>
          </div>

          {/* Pricing & Savings */}
          <div className="p-3 sm:p-4 rounded-none bg-surface dark:bg-slate-800/60 border border-outline-variant/40 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-primary dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs sm:text-sm text-outline line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {discountPct > 0 && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  Save {discountPct}% OFF
                </span>
              )}
            </div>

            {/* Stock Status Badge */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Out of Stock
                </span>
              ) : product.stock <= 3 ? (
                <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> {product.stock} Left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock ({product.stock})
                </span>
              )}
            </div>
          </div>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {product.description}
          </p>

          {/* Actions: Quantity & Add to Cart (Desktop & Mobile view) */}
          <div className="space-y-3 pt-3 border-t border-outline-variant/30">
            <div className="flex flex-row items-center gap-3">

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between border border-outline-variant/60 rounded-xl p-1 bg-surface dark:bg-slate-800 w-32 shrink-0">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 rounded-lg hover:bg-surface-container dark:hover:bg-slate-700 flex items-center justify-center font-bold text-on-surface transition active:scale-95 disabled:opacity-40"
                >
                  <Icon name="remove" className="text-xs" />
                </button>
                <span className="font-extrabold text-xs text-on-surface px-2">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-8 h-8 rounded-lg hover:bg-surface-container dark:hover:bg-slate-700 flex items-center justify-center font-bold text-on-surface transition active:scale-95 disabled:opacity-40"
                >
                  <Icon name="add" className="text-xs" />
                </button>
              </div>

              {/* Add to Cart Button (Desktop View) */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`hidden lg:flex flex-1 py-3 px-6 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] items-center justify-center gap-2 ${
                  isOutOfStock
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-secondary hover:bg-secondary-container text-white"
                }`}
              >
                <Icon name={isOutOfStock ? "block" : "add_shopping_cart"} className="text-lg" />
                <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
              </button>

              {/* Wishlist Heart Button */}
              <button
                onClick={handleWishlistToggle}
                className="p-2.5 sm:p-3 rounded-xl border border-outline-variant/60 hover:border-secondary text-outline hover:text-error transition-all flex items-center justify-center shrink-0"
                title="Save to Wishlist"
              >
                <Icon name="favorite" filled={isWishlisted} className={`text-lg sm:text-xl ${isWishlisted ? "text-red-500" : ""}`} />
              </button>
            </div>

            {/* Buy Now Button (Desktop View) */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`hidden lg:block w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] ${
                isOutOfStock
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-primary hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              }`}
            >
              Buy Now
            </button>
          </div>

          {/* Trust Features Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
            <div className="p-2 sm:p-3 rounded-xl bg-surface dark:bg-slate-800/40 border border-outline-variant/30 text-center space-y-0.5">
              <Icon name="local_shipping" className="text-secondary text-lg sm:text-xl" />
              <h4 className="text-[10px] sm:text-[11px] font-bold text-on-surface">Free Shipping</h4>
              <p className="text-[9px] sm:text-[10px] text-outline">Orders over $100</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-surface dark:bg-slate-800/40 border border-outline-variant/30 text-center space-y-0.5">
              <Icon name="verified_user" className="text-secondary text-lg sm:text-xl" />
              <h4 className="text-[10px] sm:text-[11px] font-bold text-on-surface">2-Yr Warranty</h4>
              <p className="text-[9px] sm:text-[10px] text-outline">Official coverage</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-surface dark:bg-slate-800/40 border border-outline-variant/30 text-center space-y-0.5">
              <Icon name="published_with_changes" className="text-secondary text-lg sm:text-xl" />
              <h4 className="text-[10px] sm:text-[11px] font-bold text-on-surface">30-Day Return</h4>
              <p className="text-[9px] sm:text-[10px] text-outline">Hassle free policy</p>
            </div>
          </div>

        </div>

      </section>

      {/* Technical Specifications Section */}
      <section className="pt-6 border-t border-outline-variant/30 space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-on-surface">Technical Specifications</h2>
        <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
          <table className="w-full text-xs sm:text-sm text-left">
            <tbody className="divide-y divide-outline-variant/20">
              {product.specs && Object.keys(product.specs).length > 0 ? (
                Object.entries(product.specs).map(([key, val]) => (
                  <tr key={key} className="hover:bg-surface-container/50 transition">
                    <td className="py-2.5 px-3 sm:px-4 font-bold text-on-surface w-1/3 bg-surface/50 dark:bg-slate-800/40">{key}</td>
                    <td className="py-2.5 px-3 sm:px-4 text-on-surface-variant">{val}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2.5 px-3 sm:px-4 text-outline" colSpan={2}>Standard product specifications apply.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Related Products Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="pt-6 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-on-surface">Related Products</h2>
              <p className="text-[11px] sm:text-xs text-outline">More choices in this category</p>
            </div>
            <Link to="/products" className="text-secondary text-xs sm:text-sm font-semibold hover:underline flex items-center gap-1">
              Explore All <Icon name="chevron_right" className="text-sm" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {relatedProducts.map((rel) => {
              const relImg = rel.images && rel.images.length > 0 ? rel.images[0] : "";
              return (
                <div
                  key={rel._id}
                  className="product-card bg-surface-container-lowest dark:bg-slate-800 rounded-xl sm:rounded-none shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group border border-outline-variant/30 overflow-hidden"
                >
                  <div className="relative w-full aspect-square bg-surface-container dark:bg-slate-700/50 overflow-hidden">
                    <Link to={`/product/${rel._id}`} className="w-full h-full block">
                      <img src={relImg} alt={rel.name} className="product-card-img object-cover h-full w-full group-hover:scale-105 transition-transform duration-300" />
                    </Link>
                  </div>
                  <div className="p-2.5 sm:p-4 flex-grow flex flex-col justify-between space-y-1.5 sm:space-y-2">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-secondary">{rel.category}</span>
                      <Link to={`/product/${rel._id}`} className="text-xs sm:text-sm font-bold text-on-surface line-clamp-2 leading-tight sm:leading-snug hover:text-secondary transition-colors block mt-0.5">
                        {rel.name}
                      </Link>
                    </div>
                    <div className="pt-1.5 flex items-center justify-between border-t border-outline-variant/20">
                      <span className="text-xs sm:text-sm font-extrabold text-primary dark:text-white">${rel.price.toFixed(2)}</span>
                      <Link to={`/product/${rel._id}`} className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-white px-2 py-1 rounded-lg text-xs font-bold transition">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Persistent Sticky Bottom Action Bar for Mobile Viewports */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/30 p-2.5 flex items-center gap-2 lg:hidden shadow-2xl">
        <div className="shrink-0 pr-2 border-r border-outline-variant/30">
          <span className="text-xs text-outline block leading-none">Total</span>
          <span className="text-base font-black text-primary dark:text-white">
            ${(product.price * quantity).toFixed(2)}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1 ${
            isOutOfStock
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-secondary text-white active:scale-95"
          }`}
        >
          <Icon name="add_shopping_cart" className="text-base" />
          <span>Add</span>
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1 ${
            isOutOfStock
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-primary text-white dark:bg-white dark:text-slate-900 active:scale-95"
          }`}
        >
          <span>Buy Now</span>
        </button>
      </div>

      {/* Lightbox Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
            title="Close Zoom"
          >
            <Icon name="close" className="text-xl" />
          </button>

          {/* Previous Arrow */}
          {images.length > 1 && (
            <button
              onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
            >
              <Icon name="chevron_left" className="text-xl" />
            </button>
          )}

          <img
            src={currentImage}
            alt={product.name}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />

          {/* Next Arrow */}
          {images.length > 1 && (
            <button
              onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
            >
              <Icon name="chevron_right" className="text-xl" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
