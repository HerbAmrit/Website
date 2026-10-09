import { useEffect, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi.js";

const EMPTY_FORM = {
  code: "", type: "PERCENTAGE", value: "", minOrderValue: "", maxUses: "",
  oneTimePerUser: false, freeShipping: false, expiresAt: "",
};

export default function AdminCouponsPage() {
  const { get, post, put, del } = useAdminApi();
  const [coupons, setCoupons] = useState(undefined);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function refresh() {
    get("/coupons").then(setCoupons).catch(() => setCoupons([]));
  }

  useEffect(refresh, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditing({});
  }

  function openEdit(c) {
    setForm({
      code: c.code, type: c.type, value: c.value, minOrderValue: c.minOrderValue || "",
      maxUses: c.maxUses || "", oneTimePerUser: c.oneTimePerUser, freeShipping: c.freeShipping,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setEditing(c);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      };
      if (editing?.id) {
        await put(`/coupons/${editing.id}`, payload);
      } else {
        await post("/coupons", payload);
      }
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon) {
    await put(`/coupons/${coupon.id}`, { isActive: !coupon.isActive });
    refresh();
  }

  async function handleDelete(coupon) {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    await del(`/coupons/${coupon.id}`);
    refresh();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Coupons</h1>
        <button onClick={openNew} className="btn-primary text-sm">+ New coupon</button>
      </div>

      {!coupons ? (
        <p className="text-sm text-bottle-800/60">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl2 bg-beige-50 shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-beige-200 text-xs uppercase tracking-wide text-bottle-800/50">
                <th className="p-4">Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Used</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-beige-200 last:border-0">
                  <td className="p-4 font-mono font-medium text-bottle-900">{c.code}</td>
                  <td className="p-4">{c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value} fixed`}{c.freeShipping ? " + free ship" : ""}</td>
                  <td className="p-4 text-bottle-800/60">
                    {c.minOrderValue ? `Min ₹${c.minOrderValue}` : "No minimum"}
                  </td>
                  <td className="p-4">{c.timesUsed}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? "bg-bottle-700/10 text-bottle-700" : "bg-red-100 text-red-700"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(c)} className="mr-3 text-xs font-medium text-gold-600 underline">Edit</button>
                    <button onClick={() => handleDelete(c)} className="text-xs font-medium text-red-700 underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bottle-900/50 p-4">
          <form onSubmit={handleSave} className="w-full max-w-md rounded-xl2 bg-cream p-8 shadow-2xl">
            <h2 className="mb-6 font-display text-xl text-bottle-900">{editing.id ? "Edit coupon" : "New coupon"}</h2>
            <div className="space-y-4">
              <Field label="Code" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))} required />
              <div>
                <label className="mb-1 block text-sm font-medium text-bottle-900">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-beige-300 bg-beige-50 px-4 py-2.5 text-sm outline-none focus:border-gold-500"
                >
                  <option value="PERCENTAGE">Percentage off</option>
                  <option value="FIXED">Fixed amount off</option>
                </select>
              </div>
              <Field label={form.type === "PERCENTAGE" ? "Percentage (e.g. 10)" : "Amount off (₹)"} type="number" value={form.value} onChange={(v) => setForm((f) => ({ ...f, value: v }))} required />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Min order value (₹)" type="number" value={form.minOrderValue} onChange={(v) => setForm((f) => ({ ...f, minOrderValue: v }))} />
                <Field label="Max uses" type="number" value={form.maxUses} onChange={(v) => setForm((f) => ({ ...f, maxUses: v }))} />
              </div>
              <Field label="Expires on (optional)" type="date" value={form.expiresAt} onChange={(v) => setForm((f) => ({ ...f, expiresAt: v }))} />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-bottle-900">
                  <input type="checkbox" checked={form.oneTimePerUser} onChange={(e) => setForm((f) => ({ ...f, oneTimePerUser: e.target.checked }))} />
                  One use per customer
                </label>
                <label className="flex items-center gap-2 text-sm text-bottle-900">
                  <input type="checkbox" checked={form.freeShipping} onChange={(e) => setForm((f) => ({ ...f, freeShipping: e.target.checked }))} />
                  Free shipping
                </label>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text" }) {
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
