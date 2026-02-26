"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
import { cn } from "@/lib/cn";
import { CartLink } from "@/components/cart/cart-link";
import { Container } from "@/components/site/container";

type HeaderLink = {
  label: string;
  href: string;
};

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

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/shop?category=")) return pathname === "/shop";
  if (href === "/shop") {
    return (
      pathname === "/shop" ||
      pathname.startsWith("/products/") ||
      pathname === "/cart" ||
      pathname.startsWith("/checkout")
    );
  }
  const base = href.split("?")[0] || href;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function Header({
  brandName,
  links,
}: {
  brandName: string;
  links: HeaderLink[];
}) {
  const pathname = usePathname();
  const publicLinks = links.filter((item) => !item.href.startsWith("/admin"));

  return (
    <header
      className="sticky top-0 z-50 border-b border-border/60 shadow-sm backdrop-blur-md"
      style={{
        background:
          "linear-gradient(180deg, rgb(var(--ds-muted) / 0.92), rgb(var(--ds-card) / 0.94))",
      }}
    >
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
          {brandName}
        </Link>
        <CartLink className="border border-border text-fg hover:text-accent" />
      </Container>

      <Container className="hidden h-20 items-center justify-between lg:flex">
        <div className="flex flex-1 items-center">
          <Link
            href="/"
            className="text-xl font-black uppercase tracking-tight text-fg transition-colors hover:text-accent md:text-2xl"
          >
            {brandName}
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center space-x-1">
            {publicLinks.map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                active={isNavActive(pathname, item.href)}
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
