"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { Container } from "@/components/site/container";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";

export function CartPage() {
  const { items, removeItem, setQuantity, subtotalCents } = useCart();

  return (
    <div className="py-12 md:py-16">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/60">
              Panier
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-fg md:text-5xl">
              Votre sélection
            </h1>
          </div>
          <Link
            href="/shop"
            className="hidden text-xs font-black uppercase tracking-[0.22em] text-fg/70 hover:text-fg md:inline"
          >
            Continuer
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-card p-10 text-sm text-fg/70 shadow-sm ring-1 ring-border/50">
            Panier vide.{" "}
            <Link href="/shop" className="underline underline-offset-4">
              Aller à la boutique
            </Link>
            .
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50 md:p-5"
                >
                  <div className="relative h-24 w-20 overflow-hidden rounded-xl border border-border bg-muted md:h-28 md:w-24">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-fg">
                          <Link
                            href={`/products/${item.slug}`}
                            className="hover:underline"
                          >
                            {item.name}
                          </Link>
                        </div>
                        <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-fg/55">
                          {item.colorName} • {item.size}
                        </div>
                      </div>
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                        {formatMoney(item.priceCents)}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className={cn(
                            "h-10 w-10 rounded-xl border border-border bg-bg text-sm font-bold text-fg transition hover:bg-muted",
                            item.quantity <= 1 && "opacity-50"
                          )}
                          aria-label="Diminuer la quantité"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <div className="min-w-10 text-center text-sm font-bold text-fg">
                          {item.quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          className="h-10 w-10 rounded-xl border border-border bg-bg text-sm font-bold text-fg transition hover:bg-muted"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="text-xs font-black uppercase tracking-[0.22em] text-fg/55 transition hover:text-fg"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside className="h-fit rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50 lg:sticky lg:top-24">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
                Récapitulatif
              </div>

              <div className="mt-5 grid gap-3 text-sm text-fg/75">
                <div className="flex items-center justify-between">
                  <span>Sous-total</span>
                  <span className="font-bold text-fg">
                    {formatMoney(subtotalCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-fg/50">
                  <span>Livraison</span>
                  <span>Calculée au checkout</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-fg text-sm font-black uppercase tracking-wider text-bg transition hover:bg-fg/90"
              >
                Checkout
              </Link>

              <div className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-fg/45">
                Validation de commande sur WhatsApp
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
