import { useEffect, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi.js";

export default function AdminCustomersPage() {
  const { get } = useAdminApi();
  const [customers, setCustomers] = useState(undefined);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    const timeout = setTimeout(() => {
      get(`/customers${qs}`).then(setCustomers).catch(() => setCustomers([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium">Customers</h1>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="rounded-full border border-beige-300 bg-beige-50 px-4 py-2 text-sm outline-none focus:border-gold-500"
        />
      </div>

      {!customers ? (
        <p className="text-sm text-bottle-800/60">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-bottle-800/60">No customers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl2 bg-beige-50 shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-beige-200 text-xs uppercase tracking-wide text-bottle-800/50">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Total spent</th>
                <th className="p-4">Loyalty points</th>
                <th className="p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-beige-200 last:border-0">
                  <td className="p-4 font-medium text-bottle-900">{c.name}</td>
                  <td className="p-4 text-bottle-800/70">{c.email}</td>
                  <td className="p-4">{c.orderCount}</td>
                  <td className="p-4">₹{c.totalSpent.toFixed(2)}</td>
                  <td className="p-4">{c.loyaltyPoints}</td>
                  <td className="p-4 text-bottle-800/50">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
