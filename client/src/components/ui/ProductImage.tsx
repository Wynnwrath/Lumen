import type { SyntheticEvent } from "react";
import { FALLBACK_PRODUCT_IMAGE } from "../../constants";

interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

// <img> wrapper that always renders something: falls back to the neutral
// placeholder when src is missing OR fails to load.
export const ProductImage = ({ src, alt = "", className, onClick }: ProductImageProps) => {
  // Replace the broken image with the placeholder if the URL fails to load.
  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
  };

  return (
    <img
      src={src || FALLBACK_PRODUCT_IMAGE}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={handleError}
    />
  );
};
