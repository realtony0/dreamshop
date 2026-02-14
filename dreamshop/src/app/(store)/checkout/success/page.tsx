import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { Container } from "@/components/site/container";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const orderId = typeof sp.orderId === "string" ? sp.orderId : undefined;
  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="py-12 md:py-16">
      <Container className="max-w-3xl">
        <div className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border/50 md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/60">
          Commande confirmée
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-fg md:text-5xl">
            Merci {order.firstName}.
          </h1>
          <p className="mt-4 text-base text-fg/70">
            (Démo) Une confirmation serait envoyée à{" "}
            <span className="font-bold text-fg">{order.email}</span>.
          </p>

          <div className="mt-8 grid gap-3 border-t border-border pt-6 text-sm text-fg/75">
            {order.items.map((i) => (
              <div key={i.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-fg">
                    {i.productName}
                  </div>
                  <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-fg/55">
                    {i.colorName} • {i.size} • x{i.quantity}
                  </div>
                </div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                  {formatMoney(i.unitPriceCents * i.quantity)}
                </div>
              </div>
            ))}

            <div className="mt-3 flex items-center justify-between border-t border-border pt-4">
              <span>Total</span>
              <span className="font-bold text-fg">
                {formatMoney(order.totalCents)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-fg px-6 text-sm font-black uppercase tracking-wider text-bg transition hover:bg-fg/90"
            >
              Retour boutique
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-transparent px-6 text-sm font-black uppercase tracking-wider text-fg transition hover:bg-muted"
            >
              Admin
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
