import { useEffect, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi.js";
import AdminProductImages from "./AdminProductImages.jsx";

const EMPTY_FORM = {
  name: "", slug: "", sku: "", shortDescription: "", description: "", origin: "",
  price: "", compareAtPrice: "", stock: "", categoryId: "",
};

export default function AdminProductsPage() {
  const { get, post, put, del, patch } = useAdminApi();
  const [products, setProducts] = useState(undefined);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function refresh() {
    get("/products").then(setProducts).catch((e) => setError(e.message));
  }

  useEffect(() => {
    refresh();
    get("/categories").then(setCategories).catch(() => {});
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditing({});
  }

  function openEdit(p) {
    setForm({
      name: p.name, slug: p.slug, sku: p.sku, shortDescription: p.shortDescription,
      description: p.description, origin: p.origin || "", price: p.price, compareAtPrice: p.compareAtPrice || "",
      stock: p.stock, categoryId: p.categoryId,
    });
    setEditing(p);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stock: Number(form.stock),
      };
      if (editing?.id) {
        await put(`/products/${editing.id}`, payload);
        setEditing(null);
      } else {
        // Stay open after creating, so photos can be added straight away.
        const created = await post("/products", payload);
        setEditing(created);
      }
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStockChange(product, newStock) {
    if (newStock === "" || Number.isNaN(Number(newStock))) return;
    try {
      await patch(`/products/${product.id}/stock`, { stock: Number(newStock) });
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Deactivate "${product.name}"? It will be hidden from the storefront but kept for past orders.`)) return;
    await del(`/products/${product.id}`);
    refresh();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Products</h1>
        <button onClick={openNew} className="btn-primary text-sm">+ Add product</button>
      </div>

      {error && !editing && <p className="mb-4 text-sm text-red-700">{error}</p>}

      {!products ? (
        <p className="text-sm text-bottle-800/60">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl2 bg-beige-50 shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-beige-200 text-xs uppercase tracking-wide text-bottle-800/50">
                <th className="p-4">Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-beige-200 last:border-0">
                  <td className="p-4 font-medium text-bottle-900">{p.name}</td>
                  <td className="p-4 text-bottle-800/60">{p.sku}</td>
                  <td className="p-4">₹{Number(p.price).toFixed(2)}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      defaultValue={p.stock}
                      min={0}
                      onBlur={(e) => handleStockChange(p, e.target.value)}
                      className="w-20 rounded border border-beige-300 bg-cream px-2 py-1"
                    />
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.isActive ? "bg-bottle-700/10 text-bottle-700" : "bg-red-100 text-red-700"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 text-xs font-medium text-gold-600 underline">Edit</button>
                    <button onClick={() => handleDelete(p)} className="text-xs font-medium text-red-700 underline">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bottle-900/50 p-4">
          <form onSubmit={handleSave} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl2 bg-cream p-8 shadow-2xl">
            <h2 className="mb-6 font-display text-xl text-bottle-900">{editing.id ? "Edit product" : "New product"}</h2>
            <div className="space-y-4">
              <TextField label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} required />
                <TextField label="SKU" value={form.sku} onChange={(v) => setForm((f) => ({ ...f, sku: v }))} required />
              </div>
              <TextField label="Short description" value={form.shortDescription} onChange={(v) => setForm((f) => ({ ...f, shortDescription: v }))} required />
              <div>
                <label className="mb-1 block text-sm font-medium text-bottle-900">Full description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-beige-300 bg-beige-50 px-4 py-2.5 text-sm outline-none focus:border-gold-500"
                />
              </div>
              <TextField label="Origin" value={form.origin} onChange={(v) => setForm((f) => ({ ...f, origin: v }))} />
              <div className="grid grid-cols-3 gap-4">
                <TextField label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} required />
                <TextField label="Compare-at (₹)" type="number" value={form.compareAtPrice} onChange={(v) => setForm((f) => ({ ...f, compareAtPrice: v }))} />
                <TextField label="Stock" type="number" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-bottle-900">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-beige-300 bg-beige-50 px-4 py-2.5 text-sm outline-none focus:border-gold-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 border-t border-beige-200 pt-5">
              {editing.id ? (
                <AdminProductImages product={editing} onChange={(updated) => { setEditing(updated); refresh(); }} />
              ) : (
                <p className="text-xs text-bottle-800/50">Save the product first — then you can add up to 5 photos.</p>
              )}
            </div>

            {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline text-sm">{editing.id ? "Close" : "Cancel"}</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-bottle-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-beige-300 bg-beige-50 px-4 py-2.5 text-sm outline-none focus:border-gold-500"
      />
    </div>
  );
}
