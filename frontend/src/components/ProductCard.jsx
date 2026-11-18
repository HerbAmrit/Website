import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import ProductImage from "./ProductImage.jsx";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl2 bg-beige-50 shadow-card transition-shadow hover:shadow-lg">
      <button
        onClick={() => toggle(product.slug)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-gold-600 shadow-sm transition-transform hover:scale-105"
      >
        <HeartIcon filled={wishlisted} />
      </button>

      <Link to={`/shop/${product.slug}`} className="flex h-44 items-center justify-center bg-beige-200 text-6xl">
        <ProductImage src={product.images?.[0] || product.image} alt={product.name} />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {product.compareAtPrice && (
          <span className="mb-1 w-fit rounded-full bg-gold-500/15 px-2 py-0.5 text-[11px] font-semibold text-gold-600">
            Sale
          </span>
        )}
        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-display text-lg text-bottle-900 hover:text-gold-600">{product.name}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-bottle-800/70">{product.shortDescription}</p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-bottle-900">₹{product.price}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-bottle-800/40 line-through">₹{product.compareAtPrice}</span>
          )}
        </div>

        <button
          onClick={() => addItem(product, 1)}
          disabled={outOfStock}
          className="btn-primary mt-4 w-full text-sm"
        >
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2.3 4 6.4 4 8.7 4 10.7 5.3 12 7.1 13.3 5.3 15.3 4 17.6 4c4.1 0 6 4.1 4.4 7.7C19.5 16.4 12 21 12 21z" strokeLinejoin="round" />
    </svg>
  );
}
