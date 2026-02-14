"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
import { cn } from "@/lib/cn";
import { CartLink } from "@/components/cart/cart-link";
import { Container } from "@/components/site/container";

type NavItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "Accueil",
    href: "/",
    isActive: (pathname) => pathname === "/",
  },
  {
    label: "Boutique",
    href: "/shop",
    isActive: (pathname) =>
      pathname === "/shop" ||
      pathname.startsWith("/products/") ||
      pathname === "/cart" ||
      pathname.startsWith("/checkout"),
  },
  {
    label: "Pieces",
    href: "/shop?category=HOODIE",
    isActive: () => false,
  },
  {
    label: "Ensembles",
    href: "/shop?category=SET",
    isActive: () => false,
  },
];

function DesktopNavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-6 py-3 text-sm font-black uppercase tracking-wider transition-colors",
        active ? "text-fg" : "text-fg/65 hover:text-fg"
      )}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
      ) : null}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/45 bg-card/95 shadow-sm backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between lg:hidden">
        <Link
          href="/shop"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-black uppercase tracking-[0.18em] text-fg/75 transition-colors hover:text-fg"
        >
          <Store className="h-4 w-4" />
          Shop
        </Link>
        <Link
          href="/"
          className="text-lg font-black uppercase tracking-tight text-fg transition-colors hover:text-accent"
        >
          Dreamshop
        </Link>
        <CartLink className="border border-border text-fg hover:text-accent" />
      </Container>

      <Container className="hidden h-20 items-center justify-between lg:flex">
        <div className="flex flex-1 items-center">
          <Link
            href="/"
            className="text-xl font-black uppercase tracking-tight text-fg transition-colors hover:text-accent md:text-2xl"
          >
            Dreamshop
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                active={item.isActive(pathname)}
              >
                {item.label}
              </DesktopNavLink>
            ))}
          </div>
        </nav>

        <div className="flex flex-1 items-center justify-end">
          <CartLink className="text-fg hover:text-accent" />
        </div>
      </Container>
    </header>
  );
}
