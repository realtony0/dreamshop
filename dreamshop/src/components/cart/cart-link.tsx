"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/components/cart/cart-context";

export function CartLink({ className }: { className?: string }) {
  const { itemCount } = useCart();
  const label = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <Link
      href="/cart"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
        className ?? "text-fg/70 hover:text-fg"
      )}
      aria-label="Panier"
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="sr-only">Panier</span>
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-black text-white">
          {label}
        </span>
      ) : null}
    </Link>
  );
}
