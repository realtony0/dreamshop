import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Container } from "@/components/site/container";

export function Footer() {
  return (
    <footer className="border-t border-border/45 bg-[#052659] text-bg">
      <Container className="grid gap-10 py-14 md:grid-cols-3 md:items-start">
        <div className="space-y-3">
          <div className="text-sm font-black uppercase tracking-tight">
            Dreamshop
          </div>
          <div className="text-sm text-bg/65">
            Hoodies &amp; ensembles tech fleece — drop limité.
          </div>
        </div>

        <div className="grid gap-2 text-sm">
          <Link
            href="/shop"
            className="text-bg/75 transition-colors hover:text-accent"
          >
            Boutique
          </Link>
          <Link
            href="/cart"
            className="text-bg/75 transition-colors hover:text-accent"
          >
            Panier
          </Link>
          <Link
            href="/admin"
            className="text-bg/75 transition-colors hover:text-accent"
          >
            Admin
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <ThemeSwitcher tone="dark" />
          <div className="text-xs uppercase tracking-[0.22em] text-bg/40">
            © {new Date().getFullYear()} Dreamshop
          </div>
        </div>
      </Container>
    </footer>
  );
}
