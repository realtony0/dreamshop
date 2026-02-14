import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/60">
            Commandes
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-fg md:text-5xl">
            Historique
          </h1>
        </div>
        <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/55">
          {orders.length} commande{orders.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50">
        <div className="grid grid-cols-[1.2fr_0.5fr_0.5fr_0.4fr] gap-4 border-b border-border px-6 py-4 text-xs font-black uppercase tracking-[0.22em] text-fg/55">
          <div>Client</div>
          <div>Status</div>
          <div>Total</div>
          <div>Items</div>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-10 text-sm text-fg/70">Aucune commande.</div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="grid grid-cols-[1.2fr_0.5fr_0.5fr_0.4fr] gap-4 px-6 py-5 text-sm text-fg/80 transition hover:bg-muted"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-fg">
                    {o.email}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-fg/50">
                    {new Date(o.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-fg/60">
                  {o.status}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-fg/60">
                  {formatMoney(o.totalCents)}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-fg/60">
                  {o.items.length}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
