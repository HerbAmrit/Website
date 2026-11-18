import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../utils/api.js";
import { brand } from "../data/brand.js";
import { useSettings } from "../context/SettingsContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const settings = useSettings();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";

  useEffect(() => {
    document.title = `Shop All Teas — ${brand.name}`;
  }, []);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ search, category, sort })
      .then((res) => setProducts(res.items ?? []))
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="section-container py-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Full catalog</p>
          <h1 className="text-3xl font-medium md:text-4xl">Shop all teas</h1>
        </div>
        <a
          href={settings.amazon_store_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-bottle-900"
        >
          Buy on Amazon
        </a>
      </div>

      <div className="mb-10 flex flex-wrap gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => updateParam("search", e.target.value)}
          placeholder="Search teas…"
          className="min-w-[200px] flex-1 rounded-full border border-beige-300 bg-beige-50 px-5 py-2.5 text-sm outline-none focus:border-gold-500"
          aria-label="Search teas"
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-full border border-beige-300 bg-beige-50 px-5 py-2.5 text-sm outline-none focus:border-gold-500"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-full border border-beige-300 bg-beige-50 px-5 py-2.5 text-sm outline-none focus:border-gold-500"
          aria-label="Sort products"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-bottle-800/60">Loading teas…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-bottle-800/60">No teas match your filters. Try clearing them.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
