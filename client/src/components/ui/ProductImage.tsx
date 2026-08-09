import { useState } from "react";
import { Icon } from "./Icon";

interface ProductImageProps {
  src?: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

// <img> wrapper that renders a neutral icon placeholder (no network
// dependency) when src is missing OR fails to load.
export const ProductImage = ({ src, alt = "", className, onClick }: ProductImageProps) => {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        className={`${className || ""} bg-slate-200 flex items-center justify-center text-slate-400`}
        onClick={onClick}
      >
        <Icon name="image" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onClick={onClick} onError={() => setFailed(true)} />;
};
