import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { requireAdminSession } from "@/lib/admin-server";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    await requireAdminSession();
    const status = String(formData.get("status") ?? "");
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) return;
    await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });
    revalidatePath(`/admin/orders/${id}`);
    redirect(`/admin/orders/${id}`);
  }

  return (
    <div className="grid gap-8">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/60">
          Commande
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-fg md:text-5xl">
          {order.email}
        </h1>
        <div className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-fg/55">
          {order.id} • {new Date(order.createdAt).toLocaleString("fr-FR")}
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50 md:p-8">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
            Articles
          </div>
          <div className="mt-6 grid gap-3 text-sm text-fg/75">
            {order.items.map((i) => (
              <div key={i.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-fg">{i.productName}</div>
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
              <span className="font-bold text-fg">{formatMoney(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50 md:p-8">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
              Statut
            </div>

            <form action={updateStatus} className="mt-5 grid gap-4">
              <select
                name="status"
                defaultValue={order.status}
                className="h-11 w-full rounded-xl border border-border bg-bg px-4 text-sm font-medium text-fg transition focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="CANCELED">CANCELED</option>
              </select>
              <button className="h-11 rounded-xl border border-border bg-fg text-sm font-black uppercase tracking-wider text-bg transition hover:bg-fg/90">
                Mettre à jour
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50 md:p-8">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
              Livraison
            </div>
            <div className="mt-5 grid gap-2 text-sm text-fg/75">
              <div>
                {order.firstName} {order.lastName}
              </div>
              <div>{order.address1}</div>
              {order.address2 ? <div>{order.address2}</div> : null}
              <div>
                {order.postalCode} {order.city}
              </div>
              <div>{order.country}</div>
              {order.phone ? (
                <div className="pt-2 text-xs font-black uppercase tracking-[0.18em] text-fg/55">
                  {order.phone}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
