import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Container } from "@/components/site/container";

export function Footer() {
  return (
    <footer className="border-t border-border/45 bg-card text-fg">
      <Container className="grid gap-8 py-12 pb-28 md:grid-cols-3 md:items-start md:py-14 md:pb-14">
        <div className="space-y-3">
          <div className="text-sm font-black uppercase tracking-tight">
            Dreamshop
          </div>
          <div className="text-sm text-fg/65">
            Pieces &amp; ensembles premium — drop limite.
          </div>
        </div>

        <div className="grid gap-2 text-sm">
          <Link
            href="/shop"
            className="text-fg/75 transition-colors hover:text-accent"
          >
            Boutique
          </Link>
          <Link
            href="/cart"
            className="text-fg/75 transition-colors hover:text-accent"
          >
            Panier
          </Link>
          <Link
            href="/admin"
            className="text-fg/75 transition-colors hover:text-accent"
          >
            Admin
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <ThemeSwitcher tone="light" />
          <div className="text-xs uppercase tracking-[0.22em] text-fg/40">
            © {new Date().getFullYear()} Dreamshop
          </div>
        </div>
      </Container>
    </footer>
  );
}
