import { getMaintenanceMessage } from "@/lib/site-flags";

export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  const message = getMaintenanceMessage();

  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 py-16">
      <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
        <div className="text-xs font-black uppercase tracking-[0.24em] text-fg/55">
          Dreamshop
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-fg md:text-5xl">
          Maintenance en cours
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-fg/70 md:text-base">
          {message}
        </p>

        <div className="mt-8 text-xs uppercase tracking-[0.16em] text-fg/45">
          Merci de revenir dans quelques instants.
        </div>
      </section>
    </div>
  );
}
