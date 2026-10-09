import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="text-2xl font-medium">Your cart is empty</h1>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse teas</Link>
      </div>
    );
  }

  return (
    <div className="section-container py-16">
      <h1 className="mb-10 text-3xl font-medium">Your cart</h1>
      <div className="grid gap-12 lg:grid-cols-3">
        <ul className="space-y-6 lg:col-span-2">
          {items.map((item) => (
            <li key={item.slug} className="flex gap-5 rounded-xl2 bg-beige-50 p-5 shadow-card">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-beige-200 text-4xl">
                {item.image}
              </div>
              <div className="flex-1">
                <p className="font-medium text-bottle-900">{item.name}</p>
                <p className="mt-1 text-sm text-bottle-800/60">₹{item.price} each</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-beige-300">
                    <button onClick={() => updateQuantity(item.slug, item.quantity - 1)} className="px-3 py-1.5" aria-label="Decrease quantity">−</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.slug, item.quantity + 1)} className="px-3 py-1.5" aria-label="Increase quantity">+</button>
                  </div>
                  <button onClick={() => removeItem(item.slug)} className="text-xs text-bottle-800/50 underline hover:text-bottle-800">
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-semibold text-bottle-900">₹{(item.price * item.quantity).toFixed(2)}</p>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-xl2 bg-bottle-900 p-8 text-beige-100">
          <h2 className="font-display text-xl text-cream">Order summary</h2>
          <div className="mt-6 flex justify-between text-sm">
            <span className="text-beige-100/70">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-xs text-beige-100/50">Shipping and GST calculated at checkout.</p>
          <Link to="/checkout" className="btn-gold mt-6 w-full">
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
