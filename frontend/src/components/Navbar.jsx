import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { brand } from "../data/brand.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_LINKS = [
  { label: "About", hash: "#about" },
  { label: "Shop", hash: "#shop" },
  { label: "Brew Guide", hash: "#brew-guide" },
  { label: "Loyalty", hash: "#loyalty" },
  { label: "Contact", hash: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSectionLink(hash) {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate(`/${hash}`);
    } else {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        scrolled ? "bg-beige-100/95 shadow-card backdrop-blur" : "bg-transparent"
      }`}
    >
      <nav className="section-container flex items-center justify-between py-4">
        <Link to="/" className="font-display text-xl font-semibold text-bottle-900">
          {brand.name}
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.hash}>
              <button
                onClick={() => handleSectionLink(link.hash)}
                className="text-sm font-medium text-bottle-800 transition-colors hover:text-gold-600"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link to="/account/orders" className="text-sm font-medium text-bottle-800 hover:text-gold-600">
                {user?.name?.split(" ")[0] || "Account"}
              </Link>
              <Link to="/account/loyalty" className="text-sm text-bottle-800/70 hover:text-gold-600">
                Points
              </Link>
              <button onClick={logout} className="text-sm text-bottle-800/50 hover:text-bottle-800">
                Log out
              </button>
            </div>
          ) : (
            <button onClick={openAuthModal} className="hidden text-sm font-medium text-bottle-800 hover:text-gold-600 md:block">
              Log in
            </button>
          )}
          <button
            onClick={openCart}
            className="relative rounded-full p-2 text-bottle-800 transition-colors hover:bg-beige-200"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-bottle-900">
                {itemCount}
              </span>
            )}
          </button>
          <button
            className="rounded-full p-2 text-bottle-800 hover:bg-beige-200 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <ul className="flex flex-col gap-1 bg-beige-100 px-6 pb-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.hash}>
              <button
                onClick={() => handleSectionLink(link.hash)}
                className="w-full py-2 text-left text-sm font-medium text-bottle-800"
              >
                {link.label}
              </button>
            </li>
          ))}
          <li>
            {isAuthenticated ? (
              <button onClick={logout} className="w-full py-2 text-left text-sm font-medium text-bottle-800">
                Log out
              </button>
            ) : (
              <button onClick={openAuthModal} className="w-full py-2 text-left text-sm font-medium text-bottle-800">
                Log in
              </button>
            )}
          </li>
        </ul>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="21" r="1.2" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2l2.2 12.2a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
