// FILE: src/hooks/useOnClickOutside.js
import { useEffect } from "react";

/**
 * useOnClickOutside
 * ----------------------------------------------------
 * Fires a callback when the user:
 *  - Clicks/touches outside a referenced element, or
 *  - Presses the Escape key.
 *
 * @param {React.RefObject<HTMLElement>} ref - element to detect outside clicks for
 * @param {(event: MouseEvent | TouchEvent | KeyboardEvent) => void} handler - callback to run
 *
 * Usage:
 * const ref = useRef(null);
 * useOnClickOutside(ref, () => setOpen(false));
 *
 * <div ref={ref}>Your modal here</div>
 */
export default function useOnClickOutside(ref, handler) {
  useEffect(() => {
    // Bail early if no ref or handler not a function
    if (!ref || typeof handler !== "function") return;

    const handlePointerDown = (e) => {
      // Only trigger if the click/tap was outside the element
      const el = ref.current;
      if (el && !el.contains(e.target)) {
        handler(e);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        handler(e);
      }
    };

    // Attach listeners (mousedown + touchstart for better mobile UX)
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, handler]);
}
