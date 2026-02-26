import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Container } from "@/components/site/container";

type FooterLink = {
  label: string;
  href: string;
};

export function Footer({
  brandName,
  tagline,
  links,
}: {
  brandName: string;
  tagline: string;
  links: FooterLink[];
}) {
  return (
    <footer
      className="border-t border-border/60 text-fg"
      style={{
        background:
          "linear-gradient(0deg, rgb(var(--ds-muted) / 0.78), rgb(var(--ds-card) / 0.96))",
      }}
    >
      <Container className="grid gap-8 py-12 pb-28 md:grid-cols-3 md:items-start md:py-14 md:pb-14">
        <div className="space-y-3">
          <div className="text-sm font-black uppercase tracking-tight">
            {brandName}
          </div>
          <div className="text-sm text-fg/65">{tagline}</div>
        </div>

        <div className="grid gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="text-fg/75 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
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
