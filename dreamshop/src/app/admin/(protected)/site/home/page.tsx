import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getHomeSettings, saveSiteSection } from "@/lib/site-settings";
import { requireAdminSession } from "@/lib/admin-server";

export default async function AdminSiteHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const saved = sp.saved === "1";
  const home = await getHomeSettings();

  async function saveHome(formData: FormData) {
    "use server";
    await requireAdminSession();

    await saveSiteSection("home", {
      eyebrow: String(formData.get("eyebrow") ?? ""),
      title: String(formData.get("title") ?? ""),
      subtitle: String(formData.get("subtitle") ?? ""),
      buttonLabel: String(formData.get("buttonLabel") ?? ""),
      buttonHref: String(formData.get("buttonHref") ?? "/shop"),
      backgroundImage: String(formData.get("backgroundImage") ?? ""),
      overlayOpacity: Number(formData.get("overlayOpacity") ?? 60),
    });

    revalidatePath("/");
    revalidatePath("/admin/site/home");
    redirect("/admin/site/home?saved=1");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-fg/55">
            Configuration
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-fg md:text-4xl">
            Accueil
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

      <form action={saveHome} className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-border/50">
        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Ligne haute
          </label>
          <input
            name="eyebrow"
            defaultValue={home.eyebrow}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Titre
          </label>
          <input
            name="title"
            defaultValue={home.title}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Sous-titre
          </label>
          <textarea
            name="subtitle"
            defaultValue={home.subtitle}
            className="min-h-24 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
              Texte bouton
            </label>
            <input
              name="buttonLabel"
              defaultValue={home.buttonLabel}
              className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
              Lien bouton
            </label>
            <input
              name="buttonHref"
              defaultValue={home.buttonHref}
              className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
              Image de fond
            </label>
            <input
              name="backgroundImage"
              defaultValue={home.backgroundImage}
              className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
              Opacité overlay (0-90)
            </label>
            <input
              name="overlayOpacity"
              type="number"
              min={0}
              max={90}
              defaultValue={home.overlayOpacity}
              className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
            />
          </div>
        </div>

        <button className="mt-2 h-11 rounded-xl border border-border bg-fg px-5 text-sm font-black uppercase tracking-[0.14em] text-bg transition hover:bg-fg/90">
          Enregistrer accueil
        </button>
      </form>
    </div>
  );
}
