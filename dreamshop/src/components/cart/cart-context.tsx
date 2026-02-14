"use client";

import * as React from "react";

const storageKey = "ds_cart_v1";

export type CartItem = {
  key: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  colorName: string;
  size: string;
  priceCents: number;
  imageUrl?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartContextValue = CartState & {
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  subtotalCents: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

function makeKey(variantId: string, size: string) {
  return `${variantId}:${size}`;
}

function readStorage(): CartState | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as CartState;
  } catch {
    return null;
  }
}

function writeStorage(state: CartState) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    const state = readStorage();
    if (state?.items?.length) setItems(state.items);
  }, []);

  React.useEffect(() => {
    writeStorage({ items });
  }, [items]);

  const value = React.useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.quantity * i.priceCents,
      0
    );

    return {
      items,
      addItem: (item) => {
        const key = makeKey(item.variantId, item.size);
        setItems((prev) => {
          const existing = prev.find((p) => p.key === key);
          if (!existing) return [...prev, { ...item, key }];
          return prev.map((p) =>
            p.key === key ? { ...p, quantity: p.quantity + item.quantity } : p
          );
        });
      },
      removeItem: (key) => setItems((prev) => prev.filter((p) => p.key !== key)),
      setQuantity: (key, quantity) =>
        setItems((prev) =>
          prev.map((p) =>
            p.key === key ? { ...p, quantity: Math.max(1, quantity) } : p
          )
        ),
      clear: () => setItems([]),
      itemCount,
      subtotalCents,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

