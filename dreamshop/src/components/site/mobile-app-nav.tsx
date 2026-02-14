"use client";

import type { LucideIcon } from "lucide-react";
import { Home, Layers3, ShoppingBag, Store, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/cn";

type MobileTab = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string, category: string | null) => boolean;
};

const tabs: MobileTab[] = [
  {
    id: "home",
    href: "/",
    label: "Accueil",
    icon: Home,
    isActive: (pathname) => pathname === "/",
  },
  {
    id: "shop",
    href: "/shop",
    label: "Boutique",
    icon: Store,
    isActive: (pathname, category) =>
      pathname.startsWith("/products/") || (pathname === "/shop" && !category),
  },
  {
    id: "pieces",
    href: "/shop?category=HOODIE",
    label: "Pièces",
    icon: Tag,
    isActive: (pathname, category) => pathname === "/shop" && category === "HOODIE",
  },
  {
    id: "sets",
    href: "/shop?category=SET",
    label: "Sets",
    icon: Layers3,
    isActive: (pathname, category) => pathname === "/shop" && category === "SET",
  },
  {
    id: "cart",
    href: "/cart",
    label: "Panier",
    icon: ShoppingBag,
    isActive: (pathname) =>
      pathname === "/cart" ||
      pathname === "/checkout" ||
      pathname.startsWith("/checkout/"),
  },
];

export function MobileAppNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const { itemCount } = useCart();
  const countLabel = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/55 bg-card/95 shadow-[0_-8px_28px_rgba(2,16,36,0.08)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname, category);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative inline-flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-colors",
                active
                  ? "bg-accent text-bg"
                  : "text-fg/70 hover:bg-muted hover:text-fg"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === "cart" && itemCount > 0 ? (
                <span className="absolute right-2 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-fg px-1.5 py-0.5 text-[9px] text-bg">
                  {countLabel}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
