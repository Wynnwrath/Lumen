import type { ImgHTMLAttributes } from "react";
import { FALLBACK_PRODUCT_IMAGE } from "../../constants";

// <img> wrapper that always renders something: falls back to the neutral
// placeholder when src is missing OR fails to load.
interface ProductImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> {
  src?: string;
}

export const ProductImage = ({ src, alt = "", className, ...imgProps }: ProductImageProps) => (
  <img
    src={src || FALLBACK_PRODUCT_IMAGE}
    alt={alt}
    className={className}
    {...imgProps}
    onError={(e) => {
      (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
    }}
  />
);
