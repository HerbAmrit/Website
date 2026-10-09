import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Without this, navigating while scrolled down (most commonly: clicking a footer
// link, which sits at the very bottom of a page) can land you on a shorter page
// still scrolled to the same depth — visually indistinguishable from the click
// having done nothing, even though navigation happened correctly.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return; // let the destination page's own scroll-to-section logic handle this instead
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
