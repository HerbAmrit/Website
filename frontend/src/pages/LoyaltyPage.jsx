import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

export default function LoyaltyPage() {
  const { token, isAuthenticated, openAuthModal } = useAuth();
  const settings = useSettings();
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState(undefined);

  useEffect(() => {
    if (!token) return;
    fetch("/api/loyalty/balance", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setBalance(d.balance));
    fetch("/api/loyalty/history", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setHistory);
  }, [token]);

  if (!isAuthenticated) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="text-2xl font-medium">Log in to see your points</h1>
        <button onClick={openAuthModal} className="btn-primary mt-6">Log in</button>
      </div>
    );
  }

  const redemptionRate = Number(settings.loyalty_redemption_value) || 1;

  return (
    <div className="section-container py-16">
      <h1 className="mb-2 text-3xl font-medium">Leaf Rewards</h1>
      <p className="mb-10 text-bottle-800/60">Your current points balance</p>

      <div className="mb-10 rounded-xl2 bg-bottle-900 p-8 text-beige-100">
        <p className="text-sm text-beige-100/60">Points balance</p>
        <p className="font-display text-4xl text-gold-400">{balance ?? "…"}</p>
        {balance != null && (
          <p className="mt-2 text-sm text-beige-100/60">
            Worth up to ₹{(balance * redemptionRate).toFixed(2)} off your next order — redeem at checkout.
          </p>
        )}
      </div>

      <h2 className="mb-4 font-display text-xl text-bottle-900">History</h2>
      {history === undefined ? (
        <p className="text-sm text-bottle-800/60">Loading…</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-bottle-800/60">No activity yet — points are earned automatically after a paid order.</p>
      ) : (
        <ul className="divide-y divide-beige-200 rounded-xl2 bg-beige-50 shadow-card">
          {history.map((h) => (
            <li key={h.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="text-bottle-900">{h.reason}</p>
                <p className="text-xs text-bottle-800/50">
                  {new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`font-semibold ${h.points > 0 ? "text-bottle-700" : "text-red-700"}`}>
                {h.points > 0 ? "+" : ""}{h.points}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
