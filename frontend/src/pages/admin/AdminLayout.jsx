import { NavLink, Outlet } from "react-router-dom";
import { brand } from "../../data/brand.js";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-beige-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 bg-bottle-900 text-beige-100 md:block">
          <div className="border-b border-beige-100/10 p-6">
            <p className="font-display text-lg text-cream">{brand.name}</p>
            <p className="text-xs text-beige-100/50">Admin dashboard</p>
          </div>
          <nav className="p-4">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-gold-500 text-bottle-900" : "text-beige-100/80 hover:bg-bottle-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4">
            <NavLink to="/" className="block rounded-lg px-4 py-2.5 text-sm text-beige-100/50 hover:text-beige-100">
              ← Back to storefront
            </NavLink>
          </div>
        </aside>

        <main className="flex-1 overflow-x-auto p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
