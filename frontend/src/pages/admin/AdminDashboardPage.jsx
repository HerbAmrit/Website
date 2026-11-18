import { useEffect, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi.js";

const WINDOW_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
];

const STATUS_LABELS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function AdminDashboardPage() {
  const { get } = useAdminApi();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(undefined);
    get(`/analytics/overview?days=${days}`).then(setData).catch((e) => setError(e.message));
  }, [days, get]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <div className="flex gap-2">
          {WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setDays(opt.days)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                days === opt.days ? "bg-bottle-800 text-cream" : "bg-beige-50 text-bottle-800 hover:bg-beige-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {!data ? (
        <p className="text-sm text-bottle-800/60">Loading…</p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Revenue" value={`₹${data.totalRevenue.toFixed(2)}`} />
            <StatCard label="Orders" value={data.orderCount} />
            <StatCard label="Paid orders" value={data.paidOrderCount} />
            <StatCard label="Pending (all-time)" value={data.statusCounts.PENDING} highlight={data.statusCounts.PENDING > 0} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl2 bg-beige-50 p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg text-bottle-900">Order pipeline</h2>
              <ul className="space-y-3">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <li key={key} className="flex items-center justify-between text-sm">
                    <span className="text-bottle-800/70">{label}</span>
                    <span className="font-semibold text-bottle-900">{data.statusCounts[key] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl2 bg-beige-50 p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg text-bottle-900">Best sellers ({days}d)</h2>
              {data.bestSellers.length === 0 ? (
                <p className="text-sm text-bottle-800/50">No paid orders in this window yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.bestSellers.map((p, i) => (
                    <li key={p.productId} className="flex items-center justify-between text-sm">
                      <span className="text-bottle-800/80">{i + 1}. {p.name}</span>
                      <span className="font-semibold text-bottle-900">{p.quantitySold} sold</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-xl2 bg-beige-50 p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-bottle-900">Export report</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <ExportButton format="csv" label="Download CSV" />
              <ExportButton format="pdf" label="Download PDF" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl2 p-5 shadow-card ${highlight ? "bg-gold-500/15" : "bg-beige-50"}`}>
      <p className="text-xs uppercase tracking-wide text-bottle-800/50">{label}</p>
      <p className="mt-2 font-display text-2xl text-bottle-900">{value}</p>
    </div>
  );
}

function ExportButton({ format, label }) {
  const { token } = useAdminApi();
  async function handleClick() {
    const res = await fetch(`/api/admin/reports/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert("Couldn't generate the report.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button onClick={handleClick} className="btn-outline text-sm">
      {label}
    </button>
  );
}
