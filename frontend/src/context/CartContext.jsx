import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "vg_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      // Drop any item saved before productId tracking existed (or otherwise malformed) —
      // these can't be checked out and previously caused a hard crash at checkout.
      return stored.filter((i) => i && typeof i.productId === "string" && i.productId.length > 0);
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug);
      const maxQty = product.stock ?? Infinity;
      if (existing) {
        return prev.map((i) =>
          i.slug === product.slug
            ? { ...i, quantity: Math.min(i.quantity + quantity, maxQty) }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          quantity: Math.min(quantity, maxQty),
        },
      ];
    });
    setIsOpen(true);
  }

  function updateQuantity(slug, quantity) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, quantity: Math.min(quantity, i.stock ?? Infinity) } : i))
    );
  }

  function removeItem(slug) {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
