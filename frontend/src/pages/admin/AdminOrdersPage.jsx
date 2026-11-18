import { useEffect, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi.js";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { get, patch } = useAdminApi();
  const [statusFilter, setStatusFilter] = useState("");
  const [orders, setOrders] = useState(undefined);
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  function refresh() {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    get(`/orders${qs}`).then((res) => setOrders(res.items)).catch(() => setOrders([]));
  }

  useEffect(refresh, [statusFilter]);

  async function handleStatusChange(order, status) {
    setUpdating(order.id);
    try {
      await patch(`/orders/${order.id}/status`, { status });
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-full border border-beige-300 bg-beige-50 px-4 py-2 text-sm outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!orders ? (
        <p className="text-sm text-bottle-800/60">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-bottle-800/60">No orders match this filter.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl2 bg-beige-50 shadow-card">
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
              >
                <div>
                  <p className="font-medium text-bottle-900">{order.orderNumber}</p>
                  <p className="text-sm text-bottle-800/60">{order.user.name} · {order.user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-bottle-800/60">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  <span className="font-semibold text-bottle-900">₹{Number(order.total).toFixed(2)}</span>
                  <select
                    value={order.status}
                    disabled={updating === order.id}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className="rounded-full border border-beige-300 bg-cream px-3 py-1.5 text-xs font-semibold"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t border-beige-200 p-5">
                  <ul className="mb-3 space-y-1 text-sm text-bottle-800/80">
                    {order.items.map((item) => (
                      <li key={item.id}>{item.product.name} × {item.quantity} — ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-bottle-800/50">Payment: {order.paymentStatus}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
