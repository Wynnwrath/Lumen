import { useEffect, useRef } from "react";
import type { RefObject } from "react";

// runs the callback when the user clicks outside the given ref(s)
export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onOutside: () => void
) {
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;
  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const list = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const clickedInside = list.some((ref) => ref.current && ref.current.contains(e.target as Node));
      if (!clickedInside) onOutsideRef.current();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
}
