"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { Container } from "@/components/site/container";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";

type ProductDetailProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    category: "HOODIE" | "SET";
    variants: {
      id: string;
      colorName: string;
      colorHex: string | null;
      images: { id: string; url: string; alt: string | null; sort: number }[];
      stock: { id: string; size: string; quantity: number }[];
    }[];
  };
};

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();

  const firstVariant = product.variants[0];
  const [variantId, setVariantId] = React.useState<string>(firstVariant?.id);

  const variant =
    product.variants.find((v) => v.id === variantId) ?? firstVariant;

  const sortedImages = React.useMemo(
    () => [...(variant?.images ?? [])].sort((a, b) => a.sort - b.sort),
    [variant?.images]
  );

  const inStockSizes = React.useMemo(() => {
    const stock = [...(variant?.stock ?? [])].sort((a, b) =>
      a.size.localeCompare(b.size)
    );
    return stock;
  }, [variant?.stock]);

  const firstAvailableSize =
    inStockSizes.find((s) => s.quantity > 0)?.size ?? "";
  const [size, setSize] = React.useState<string>(firstAvailableSize);
  const [activeImageUrl, setActiveImageUrl] = React.useState<string>(
    sortedImages[0]?.url ?? ""
  );
  const [justAdded, setJustAdded] = React.useState(false);

  React.useEffect(() => {
    setActiveImageUrl(sortedImages[0]?.url ?? "");
    setJustAdded(false);
  }, [variantId, sortedImages]);

  React.useEffect(() => {
    if (!size) {
      setSize(firstAvailableSize);
      return;
    }

    const ok = inStockSizes.some((s) => s.size === size && s.quantity > 0);
    if (!ok) setSize(firstAvailableSize);
  }, [variantId, firstAvailableSize, inStockSizes, size]);

  const isSizeAvailable = (s: string) =>
    inStockSizes.some((x) => x.size === s && x.quantity > 0);

  const canAdd = Boolean(variant && size && isSizeAvailable(size));

  function handleAddToCart() {
    if (!variant || !canAdd) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      colorName: variant.colorName,
      size,
      priceCents: product.priceCents,
      imageUrl: activeImageUrl,
      quantity: 1,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="py-10 md:py-16">
      <Container>
        <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/60">
          <Link href="/shop" className="hover:text-fg">
            Boutique
          </Link>{" "}
          / {product.category === "HOODIE" ? "Pieces" : "Ensembles"}
        </div>

        <div className="mt-6 grid gap-8 md:mt-10 md:gap-10 lg:grid-cols-[1.25fr_0.9fr]">
          <section>
            <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50">
              <div className="relative aspect-[4/5] w-full">
                {activeImageUrl ? (
                  <Image
                    src={activeImageUrl}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
              </div>
            </div>

            {sortedImages.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:grid-cols-6 sm:gap-3">
                {sortedImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageUrl(img.url)}
                    className={cn(
                      "relative overflow-hidden rounded-xl border border-border bg-card transition",
                      img.url === activeImageUrl
                        ? "ring-2 ring-accent/40"
                        : "hover:border-accent/40"
                    )}
                    aria-label="Voir l'image"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={img.url}
                        alt={img.alt ?? product.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="h-fit lg:sticky lg:top-24">
            <h1 className="text-3xl font-black tracking-tight text-fg sm:text-4xl md:text-5xl">
              {product.name}
            </h1>
            <div className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-fg/60">
              {formatMoney(product.priceCents)} • Stock par taille
            </div>
            <p className="mt-5 text-sm leading-relaxed text-fg/70 sm:text-base">
              {product.description}
            </p>

            <div className="mt-6 grid gap-6 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50 sm:mt-8 sm:gap-7 sm:p-6 md:mt-10">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                  Couleur
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const selected = v.id === variantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVariantId(v.id)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm",
                          selected
                            ? "border-fg bg-fg text-bg"
                            : "border-border bg-transparent text-fg/80 hover:bg-muted"
                        )}
                      >
                        <span
                          className="h-3 w-3 rounded-full ring-1 ring-black/10"
                          style={
                            v.colorHex
                              ? { backgroundColor: v.colorHex }
                              : undefined
                          }
                        />
                        {v.colorName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                  Taille
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {inStockSizes.map((s) => {
                    const available = s.quantity > 0;
                    const selected = s.size === size;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={!available}
                        onClick={() => setSize(s.size)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm",
                          selected
                            ? "border-fg bg-fg text-bg"
                            : "border-border bg-transparent text-fg/80 hover:bg-muted",
                          !available && "cursor-not-allowed opacity-40"
                        )}
                        aria-label={`Taille ${s.size}`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAdd}
                className={cn(
                  "h-12 w-full rounded-xl border border-border bg-fg text-sm font-black uppercase tracking-wider text-bg transition hover:bg-fg/90 focus:outline-none focus:ring-2 focus:ring-accent/30",
                  !canAdd && "cursor-not-allowed opacity-60 hover:bg-fg"
                )}
              >
                {justAdded ? "Ajouté" : "Ajouter au panier"}
              </button>

              <div className="grid gap-2 text-xs font-black uppercase tracking-[0.22em] text-fg/50">
                <div>Livraison 48–72h (demo)</div>
                <div>Retours 14 jours</div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
