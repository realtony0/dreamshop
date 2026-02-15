import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminSitePage() {
  const settings = await getSiteSettings();

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.24em] text-fg/55">
          Configuration
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-fg md:text-4xl">
          Site
        </h1>
        <p className="mt-2 text-sm text-fg/65">
          Modifie chaque partie du storefront depuis des pages séparées.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href="/admin/site/home"
          className="rounded-2xl bg-card p-5 ring-1 ring-border/50 transition hover:bg-muted"
        >
          <div className="text-xs font-black uppercase tracking-[0.16em] text-fg/55">
            Accueil
          </div>
          <div className="mt-2 text-lg font-black text-fg">{settings.home.title}</div>
          <div className="mt-1 text-sm text-fg/65">Hero + bouton principal</div>
        </Link>

        <Link
          href="/admin/site/navigation"
          className="rounded-2xl bg-card p-5 ring-1 ring-border/50 transition hover:bg-muted"
        >
          <div className="text-xs font-black uppercase tracking-[0.16em] text-fg/55">
            Navigation & Footer
          </div>
          <div className="mt-2 text-lg font-black text-fg">{settings.header.brandName}</div>
          <div className="mt-1 text-sm text-fg/65">
            {settings.header.links.length} liens header • {settings.footer.links.length} liens
            footer
          </div>
        </Link>

        <Link
          href="/admin/site/checkout"
          className="rounded-2xl bg-card p-5 ring-1 ring-border/50 transition hover:bg-muted"
        >
          <div className="text-xs font-black uppercase tracking-[0.16em] text-fg/55">
            Commande
          </div>
          <div className="mt-2 text-lg font-black text-fg">{settings.checkout.baseCountry}</div>
          <div className="mt-1 text-sm text-fg/65">
            {settings.checkout.internationalShipping
              ? "Vente internationale active"
              : "Vente locale uniquement"}
          </div>
        </Link>
      </div>
    </div>
  );
}
