import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_STYLES = {
  PENDING: "bg-beige-200 text-bottle-800",
  PROCESSING: "bg-gold-500/20 text-gold-600",
  SHIPPED: "bg-bottle-800/10 text-bottle-800",
  DELIVERED: "bg-bottle-700 text-cream",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrderHistoryPage() {
  const { token, isAuthenticated, openAuthModal } = useAuth();
  const [orders, setOrders] = useState(undefined);

  useEffect(() => {
    if (!token) return;
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then(setOrders);
  }, [token]);

  if (!isAuthenticated) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="text-2xl font-medium">Log in to see your orders</h1>
        <button onClick={openAuthModal} className="btn-primary mt-6">Log in</button>
      </div>
    );
  }

  return (
    <div className="section-container py-16">
      <h1 className="mb-10 text-3xl font-medium">Your orders</h1>

      {orders === undefined ? (
        <p className="text-sm text-bottle-800/60">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="text-center">
          <p className="text-bottle-800/60">You haven't placed any orders yet.</p>
          <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse teas</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/order-confirmation/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 bg-beige-50 p-5 shadow-card transition-shadow hover:shadow-lg"
              >
                <div>
                  <p className="font-medium text-bottle-900">{order.orderNumber}</p>
                  <p className="text-sm text-bottle-800/60">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}{order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status] || ""}`}>
                    {order.status}
                  </span>
                  <span className="font-semibold text-bottle-900">₹{Number(order.total).toFixed(2)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
