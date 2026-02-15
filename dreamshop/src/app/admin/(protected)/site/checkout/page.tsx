import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCheckoutSettings, saveSiteSection } from "@/lib/site-settings";
import { requireAdminSession } from "@/lib/admin-server";

export default async function AdminSiteCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const saved = sp.saved === "1";
  const checkout = await getCheckoutSettings();

  async function saveCheckout(formData: FormData) {
    "use server";
    await requireAdminSession();

    await saveSiteSection("checkout", {
      baseCountry: String(formData.get("baseCountry") ?? "Sénégal"),
      internationalShipping: formData.get("internationalShipping") === "on",
      note: String(formData.get("note") ?? ""),
    });

    revalidatePath("/checkout");
    revalidatePath("/admin/site/checkout");
    redirect("/admin/site/checkout?saved=1");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-fg/55">
            Configuration
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-fg md:text-4xl">
            Commande
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

      <form action={saveCheckout} className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-border/50">
        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Pays de base
          </label>
          <input
            name="baseCountry"
            defaultValue={checkout.baseCountry}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-fg/80">
          <input
            type="checkbox"
            name="internationalShipping"
            defaultChecked={checkout.internationalShipping}
          />
          Vendre à l&apos;international
        </label>

        <div className="grid gap-2">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-fg/55">
            Message checkout
          </label>
          <input
            name="note"
            defaultValue={checkout.note}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <button className="h-11 rounded-xl border border-border bg-fg px-5 text-sm font-black uppercase tracking-[0.14em] text-bg transition hover:bg-fg/90">
          Enregistrer commande
        </button>
      </form>
    </div>
  );
}
