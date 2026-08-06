import { useEffect } from "react";
import type { RefObject } from "react";

// runs the callback when the user clicks outside the given ref(s)
export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onOutside: () => void
) {
  const list = Array.isArray(refs) ? refs : [refs];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const clickedInside = list.some((ref) => ref.current && ref.current.contains(e.target as Node));
      if (!clickedInside) onOutside();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
}
