import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

const lowStockThreshold = 3;

export default async function AdminDashboardPage() {
  const [salesAgg, orderCount, lowStockCount, latestOrders, lowStock] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: "CANCELED" } },
        _sum: { totalCents: true },
      }),
      prisma.order.count(),
      prisma.stockItem.count({ where: { quantity: { lte: lowStockThreshold } } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, status: true, totalCents: true, createdAt: true },
      }),
      prisma.stockItem.findMany({
        where: { quantity: { lte: lowStockThreshold } },
        take: 10,
        orderBy: [{ quantity: "asc" }],
        include: {
          variant: {
            include: { product: true },
          },
        },
      }),
    ]);

  const totalSalesCents = salesAgg._sum.totalCents ?? 0;

  return (
    <div className="grid gap-8">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/60">
          Dashboard
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-fg md:text-5xl">
          Aperçu
        </h1>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/55">
            Ventes
          </div>
          <div className="mt-3 text-3xl font-black text-fg">
            {formatMoney(totalSalesCents)}
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/55">
            Commandes
          </div>
          <div className="mt-3 text-3xl font-black text-fg">
            {orderCount}
          </div>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/55">
            Stock faible
          </div>
          <div className="mt-3 text-3xl font-black text-fg">
            {lowStockCount}
          </div>
          <div className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-fg/45">
            ≤ {lowStockThreshold}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
              Sections du site
            </div>
            <Link href="/admin/site" className="text-xs uppercase tracking-[0.22em] text-fg/60 hover:text-fg">
              Ouvrir
            </Link>
          </div>
          <div className="mt-6 grid gap-2 text-sm">
            <Link href="/admin/site/home" className="rounded-xl border border-border bg-bg px-4 py-3 text-fg/80 hover:bg-muted">
              Accueil
            </Link>
            <Link href="/admin/site/navigation" className="rounded-xl border border-border bg-bg px-4 py-3 text-fg/80 hover:bg-muted">
              Navigation et footer
            </Link>
            <Link href="/admin/site/checkout" className="rounded-xl border border-border bg-bg px-4 py-3 text-fg/80 hover:bg-muted">
              Formulaire de commande
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
              Dernières commandes
            </div>
            <Link href="/admin/orders" className="text-xs uppercase tracking-[0.22em] text-fg/60 hover:text-fg">
              Tout voir
            </Link>
          </div>

          {latestOrders.length === 0 ? (
            <div className="mt-6 text-sm text-fg/65">Aucune commande.</div>
          ) : (
            <div className="mt-6 grid gap-3">
              {latestOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg/80 transition hover:bg-muted"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-fg">{o.email}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-fg/50">
                      {o.status}
                    </div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-fg/60">
                    {formatMoney(o.totalCents)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
              Stocks faibles
            </div>
            <Link href="/admin/products" className="text-xs uppercase tracking-[0.22em] text-fg/60 hover:text-fg">
              Gérer
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <div className="mt-6 text-sm text-fg/65">RAS.</div>
          ) : (
            <div className="mt-6 grid gap-3">
              {lowStock.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg/80"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-fg">
                      {s.variant.product.name}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-fg/50">
                      {s.variant.colorName} • {s.size}
                    </div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-fg/60">
                    {s.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
