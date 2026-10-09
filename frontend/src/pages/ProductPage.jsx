import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductBySlug } from "../utils/api.js";
import { brand } from "../data/brand.js";
import { useSettings } from "../context/SettingsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import BrewRing from "../components/BrewRing.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(undefined); // undefined = loading, null = not found
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const settings = useSettings();

  useEffect(() => {
    setProduct(undefined);
    fetchProductBySlug(slug).then((p) => setProduct(p ?? null));
  }, [slug]);

  useEffect(() => {
    if (product) document.title = `${product.name} — ${brand.name}`;
  }, [product]);

  if (product === undefined) {
    return <div className="section-container py-24 text-center text-bottle-800/60">Loading…</div>;
  }
  if (product === null) {
    return <NotFoundPage />;
  }

  const outOfStock = product.stock <= 0;
  const amazonUrl = product.amazonUrl || settings.amazon_store_url;

  return (
    <div className="section-container py-16">
      <nav className="mb-8 text-sm text-bottle-800/50">
        <Link to="/shop" className="hover:text-bottle-800">Shop</Link> / {product.name}
      </nav>

      <div className="grid gap-14 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-xl2 bg-beige-200 text-[10rem]">
          <span aria-hidden="true">{product.image}</span>
        </div>

        <div>
          {product.origin && <p className="eyebrow mb-3">{product.origin}</p>}
          <h1 className="text-3xl font-medium md:text-4xl">{product.name}</h1>

          {product.rating && (
            <div className="mt-2 flex items-center gap-2 text-sm text-bottle-800/70">
              <span className="text-gold-500">{"★".repeat(Math.round(product.rating))}</span>
              <span>{product.rating} ({product.reviewCount} reviews)</span>
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-bottle-900">₹{product.price}</span>
            {product.compareAtPrice && (
              <span className="text-base text-bottle-800/40 line-through">₹{product.compareAtPrice}</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-bottle-800/80">{product.description}</p>

          <p className={`mt-4 text-sm font-medium ${outOfStock ? "text-red-700" : "text-bottle-600"}`}>
            {outOfStock ? "Out of stock" : product.stock <= 8 ? `Only ${product.stock} left in stock` : "In stock"}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-beige-300">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2" aria-label="Decrease quantity">−</button>
              <span className="w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-2" aria-label="Increase quantity">+</button>
            </div>
            <button
              onClick={() => addItem(product, quantity)}
              disabled={outOfStock}
              className="btn-primary"
            >
              {outOfStock ? "Out of stock" : "Add to cart"}
            </button>
            <button
              onClick={() => toggle(product.slug)}
              aria-pressed={isWishlisted(product.slug)}
              className="btn-outline"
            >
              {isWishlisted(product.slug) ? "Wishlisted ♥" : "Add to wishlist"}
            </button>
          </div>

          <div className="mt-6">
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gold-600 underline underline-offset-2 hover:text-gold-500"
            >
              Prefer Amazon? Buy this tea there instead →
            </a>
          </div>
        </div>
      </div>

      {product.brewGuide && (
        <div className="mt-24 rounded-xl2 bg-bottle-900 p-10 text-beige-100 md:p-16">
          <p className="eyebrow mb-3 text-gold-400">Brew guide</p>
          <h2 className="text-2xl font-medium md:text-3xl">How to brew {product.name}</h2>

          <div className="mt-10 grid gap-12 md:grid-cols-2 md:items-center">
            <dl className="grid grid-cols-2 gap-8">
              <BrewStat label="Water temperature" value={`${product.brewGuide.waterTempCelsius}°C`} />
              <BrewStat label="Tea quantity" value={`${product.brewGuide.teaQuantityGrams}g per cup`} />
              <BrewStat label="Brew time" value={`${Math.round(product.brewGuide.brewTimeSeconds / 60)} min ${product.brewGuide.brewTimeSeconds % 60 || ""}${product.brewGuide.brewTimeSeconds % 60 ? "s" : ""}`} />
              <BrewStat label="Infusions" value={`${product.brewGuide.infusions}×`} />
            </dl>

            <div className="flex flex-col items-center gap-6">
              <BrewRing brewTimeSeconds={product.brewGuide.brewTimeSeconds} size={190} />
              <p className="max-w-xs text-center text-sm text-beige-100/60">
                {product.brewGuide.servingSuggestion}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BrewStat({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-beige-100/50">{label}</dt>
      <dd className="mt-1 font-display text-xl text-cream">{value}</dd>
    </div>
  );
}
