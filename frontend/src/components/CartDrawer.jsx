import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-bottle-900/40"
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-beige-200 px-6 py-5">
              <h2 className="font-display text-xl text-bottle-900">Your cart</h2>
              <button onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 hover:bg-beige-100">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <p className="mt-10 text-center text-sm text-bottle-800/60">Your cart is empty.</p>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.slug} className="flex gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-beige-200 text-3xl">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-bottle-900">{item.name}</p>
                        <p className="mt-1 text-sm text-bottle-800/60">₹{item.price}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex items-center rounded-full border border-beige-300">
                            <button
                              onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                              className="px-2.5 py-1 text-sm"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                              className="px-2.5 py-1 text-sm"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.slug)}
                            className="text-xs text-bottle-800/50 underline hover:text-bottle-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-beige-200 px-6 py-5">
                <div className="mb-4 flex items-center justify-between text-sm text-bottle-800/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-bottle-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <p className="mb-4 text-xs text-bottle-800/50">Shipping and GST are calculated at checkout.</p>
                <Link to="/checkout" onClick={closeCart} className="btn-primary w-full">
                  Proceed to checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
