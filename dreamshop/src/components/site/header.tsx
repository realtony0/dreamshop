"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/45 bg-card/95 shadow-sm backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between md:h-20">
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

        <div className="flex flex-1 items-center justify-end gap-3">
          <CartLink className="text-fg hover:text-accent" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-fg transition-colors hover:text-accent lg:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {open ? (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 top-16 z-50 border-t border-border bg-card/95 backdrop-blur-md md:top-20">
            <Container className="py-6">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wider transition-colors",
                      item.isActive(pathname)
                        ? "bg-fg text-bg"
                        : "text-fg/80 hover:bg-muted hover:text-fg"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </Container>
          </div>
        </div>
      ) : null}
    </header>
  );
}
