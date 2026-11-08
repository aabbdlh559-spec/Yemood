import { useLayoutEffect } from "react";

/** The class that switches the page to the Yemood cover colours; see styles.css. */
export const COVER_CLASS = "yemood-cover";

/**
 * Dresses the whole page in the Yemood cover colours while the calling screen is mounted.
 * Only the landing and contact screens call it, so the game screens keep their own look.
 */
export function useCoverTheme(): void {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add(COVER_CLASS);
    return () => root.classList.remove(COVER_CLASS);
  }, []);
}
