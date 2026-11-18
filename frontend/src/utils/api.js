import { products as demoProducts, categories as demoCategories, getProductBySlug as getDemoProductBySlug } from "../data/products.js";

// Lets the storefront run standalone (demo data) before the backend is deployed,
// and switch to the real API transparently once it's up — no component changes needed.

export async function fetchProducts(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("API not ready");
    return await res.json();
  } catch {
    let items = demoProducts;
    if (params.category) items = items.filter((p) => p.category === params.category);
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q)
      );
    }
    if (params.sort === "price_asc") items = [...items].sort((a, b) => a.price - b.price);
    if (params.sort === "price_desc") items = [...items].sort((a, b) => b.price - a.price);
    return { items, total: items.length };
  }
}

export async function fetchProductBySlug(slug) {
  try {
    const res = await fetch(`/api/products/${slug}`);
    if (!res.ok) throw new Error("API not ready");
    return await res.json();
  } catch {
    return getDemoProductBySlug(slug) ?? null;
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`/api/products/categories`);
    if (!res.ok) throw new Error("API not ready");
    return await res.json();
  } catch {
    return demoCategories;
  }
}
