import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getFooterSettings,
  getHeaderSettings,
  parseLinks,
  saveSiteSection,
  serializeLinks,
  siteDefaults,
} from "@/lib/site-settings";
import { requireAdminSession } from "@/lib/admin-server";

export default async function AdminSiteNavigationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const saved = sp.saved === "1";
  const [header, footer] = await Promise.all([getHeaderSettings(), getFooterSettings()]);

  async function saveNavigation(formData: FormData) {
    "use server";
    await requireAdminSession();

    const headerLinks = parseLinks(
      String(formData.get("headerLinks") ?? ""),
      siteDefaults.header.links
    );
    const footerLinks = parseLinks(
      String(formData.get("footerLinks") ?? ""),
      siteDefaults.footer.links
    );

    await saveSiteSection("header", {
      brandName: String(formData.get("headerBrandName") ?? ""),
      links: headerLinks,
    });

    await saveSiteSection("footer", {
      brandName: String(formData.get("footerBrandName") ?? ""),
      tagline: String(formData.get("footerTagline") ?? ""),
      links: footerLinks,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/site/navigation");
    redirect("/admin/site/navigation?saved=1");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-fg/55">
            Configuration
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-fg md:text-4xl">
            Navigation & Footer
          </h1>
        </div>
        <Link
          href="/admin/site"
          className="inline-flex h-10 items-center rounded-lg border border-border bg-bg px-4 text-xs font-black uppercase tracking-[0.14em] text-fg/75 transition hover:bg-muted"
        >
          Retour
        </Link>
      </div>

      {saved ? (
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-fg/80">
          Modifications enregistrées.
        </div>
      ) : null}

      <form
        action={saveNavigation}
        className="grid gap-5 rounded-2xl bg-card p-5 ring-1 ring-border/50"
      >
        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Nom marque (header)
          </label>
          <input
            name="headerBrandName"
            defaultValue={header.brandName}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Liens header (1 par ligne: label|href)
          </label>
          <textarea
            name="headerLinks"
            defaultValue={serializeLinks(header.links)}
            className="min-h-32 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Nom marque (footer)
          </label>
          <input
            name="footerBrandName"
            defaultValue={footer.brandName}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Tagline footer
          </label>
          <input
            name="footerTagline"
            defaultValue={footer.tagline}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Liens footer (1 par ligne: label|href)
          </label>
          <textarea
            name="footerLinks"
            defaultValue={serializeLinks(footer.links)}
            className="min-h-28 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <button className="h-11 rounded-xl border border-border bg-fg px-5 text-sm font-black uppercase tracking-[0.14em] text-bg transition hover:bg-fg/90">
          Enregistrer navigation
        </button>
      </form>
    </div>
  );
}
