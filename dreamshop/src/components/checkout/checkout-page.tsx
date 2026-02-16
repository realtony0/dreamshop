"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { Container } from "@/components/site/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/money";

type CheckoutResponse =
  | { ok: true; orderId: string; whatsappUrl: string }
  | { ok: false; error: string };

export function CheckoutPage({
  defaultCountry,
  checkoutNote,
}: {
  defaultCountry: string;
  checkoutNote: string;
}) {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: "",
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address1: String(form.get("address1") ?? ""),
      city: String(form.get("city") ?? ""),
      country: defaultCountry,
      items: items.map((i) => ({
        variantId: i.variantId,
        size: i.size,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as CheckoutResponse;
      if (!res.ok || !data.ok) {
        setError("error" in data ? data.error : "Checkout impossible.");
        setPending(false);
        return;
      }

      clear();
      if (typeof window !== "undefined") {
        window.location.assign(data.whatsappUrl);
        return;
      }

      router.push(`/checkout/success?orderId=${encodeURIComponent(data.orderId)}`);
    } catch {
      setError("Erreur réseau. Réessaie.");
      setPending(false);
    }
  }

  return (
    <div className="py-12 md:py-16">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/60">
              Commande
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-fg md:text-5xl">
              Formulaire rapide
            </h1>
            <div className="mt-2 text-sm text-fg/65">
              {checkoutNote}
            </div>
          </div>
          <Link
            href="/cart"
            className="hidden text-xs font-black uppercase tracking-[0.22em] text-fg/70 hover:text-fg md:inline"
          >
            Retour panier
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
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px]">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50 md:p-8"
            >
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input id="fullName" name="fullName" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address1">Adresse complète</Label>
                  <Input
                    id="address1"
                    name="address1"
                    placeholder="Ex: Dakar, Liberté 6, Sénégal"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" name="city" required />
                </div>

                {error ? (
                  <div className="rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg/80">
                    {error}
                  </div>
                ) : null}

                <button
                  disabled={pending}
                  className="h-12 w-full rounded-xl border border-border bg-fg text-sm font-black uppercase tracking-wider text-bg transition hover:bg-fg/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Traitement..." : "Commander maintenant"}
                </button>

                <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/45">
                  Confirmation par message apres envoi
                </div>
              </div>
            </form>

            <aside className="h-fit rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/50 lg:sticky lg:top-24">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
                Résumé
              </div>
              <div className="mt-5 grid gap-3 text-sm text-fg/75">
                {items.map((i) => (
                  <div
                    key={i.key}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-fg">
                        {i.name}
                      </div>
                      <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-fg/55">
                        {i.colorName} • {i.size} • x{i.quantity}
                      </div>
                    </div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                      {formatMoney(i.priceCents * i.quantity)}
                    </div>
                  </div>
                ))}

                <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
                  <span>Sous-total</span>
                  <span className="font-bold text-fg">
                    {formatMoney(subtotalCents)}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
