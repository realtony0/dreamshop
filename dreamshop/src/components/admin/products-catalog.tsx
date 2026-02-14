"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

type AdminCatalogVariant = {
  id: string;
  colorName: string;
  colorHex: string | null;
  stock: Array<{ size: string; quantity: number }>;
  images: string[];
  totalStock: number;
};

export type AdminCatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: "HOODIE" | "SET";
  priceCents: number;
  active: boolean;
  featured: boolean;
  totalStock: number;
  imageCount: number;
  coverImage: string | null;
  variants: AdminCatalogVariant[];
};

type CategoryFilter = "ALL" | "HOODIE" | "SET";

const lowStockThreshold = 3;

function stockLabel(quantity: number) {
  if (quantity === 0) return "Rupture";
  if (quantity <= lowStockThreshold) return "Stock faible";
  return `Stock ${quantity}`;
}

export function AdminProductsCatalog({
  products,
}: {
  products: AdminCatalogProduct[];
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<CategoryFilter>("ALL");
  const [onlyLowStock, setOnlyLowStock] = React.useState(false);
  const [openProductId, setOpenProductId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (category !== "ALL" && product.category !== category) return false;
      if (onlyLowStock && product.totalStock > lowStockThreshold) return false;

      if (!q) return true;
      const inProduct =
        product.name.toLowerCase().includes(q) || product.slug.toLowerCase().includes(q);
      if (inProduct) return true;
      return product.variants.some((variant) =>
        variant.colorName.toLowerCase().includes(q)
      );
    });
  }, [category, onlyLowStock, products, query]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/55">
            Produits
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-fg md:text-5xl">
            Catalogue simple
          </h1>
          <div className="mt-2 text-sm text-fg/65">
            Vue compacte. Clique sur Details seulement si nécessaire.
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-fg px-5 text-sm font-black uppercase tracking-wider text-bg transition hover:bg-fg/90"
        >
          Nouveau produit
        </Link>
      </div>

      <section className="grid gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div className="grid gap-2">
          <label
            htmlFor="catalog-search"
            className="text-xs font-black uppercase tracking-[0.18em] text-fg/55"
          >
            Recherche
          </label>
          <input
            id="catalog-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, slug, couleur..."
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none transition focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="catalog-category"
            className="text-xs font-black uppercase tracking-[0.18em] text-fg/55"
          >
            Catégorie
          </label>
          <select
            id="catalog-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryFilter)}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none transition focus:ring-2 focus:ring-accent/35"
          >
            <option value="ALL">Toutes</option>
            <option value="HOODIE">Pieces</option>
            <option value="SET">Ensembles</option>
          </select>
        </div>

        <button
          onClick={() => setOnlyLowStock((v) => !v)}
          className={cn(
            "h-11 rounded-xl border px-4 text-xs font-black uppercase tracking-[0.18em] transition",
            onlyLowStock
              ? "border-fg bg-fg text-bg"
              : "border-border bg-bg text-fg hover:bg-muted"
          )}
        >
          Stock faible
        </button>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-sm text-fg/65 shadow-sm ring-1 ring-border/50">
          Aucun produit pour ce filtre.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((product) => {
            const isOpen = openProductId === product.id;
            const colorPreview = product.variants.slice(0, 6);

            return (
              <article
                key={product.id}
                className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50"
              >
                <div className="grid grid-cols-[56px_1fr] gap-3 md:grid-cols-[56px_1fr_auto]">
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
                    {product.coverImage ? (
                      <Image
                        src={product.coverImage}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-black uppercase tracking-[0.15em] text-fg/45">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-lg font-black text-fg">{product.name}</div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-fg/70">
                        {product.category === "HOODIE" ? "Piece" : "Ensemble"}
                      </span>
                      <span className="inline-flex rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-fg/70">
                        {product.active ? "Actif" : "Off"}
                      </span>
                      <span className="inline-flex rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-fg/70">
                        {stockLabel(product.totalStock)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      {colorPreview.map((variant) => (
                        <span
                        key={variant.id}
                        className="h-4 w-4 rounded-full border border-fg/20"
                        style={{ backgroundColor: variant.colorHex ?? "#0a0a0a" }}
                        title={variant.colorName}
                      />
                      ))}
                      {product.variants.length > colorPreview.length ? (
                        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-fg/45">
                          +{product.variants.length - colorPreview.length}
                        </span>
                      ) : null}
                      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-fg/45">
                        {product.imageCount} photo{product.imageCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                    <div className="col-span-2 flex items-center justify-between gap-2 pt-2 md:col-span-1 md:flex-col md:items-end md:justify-start md:pt-0">
                    <div className="text-sm font-black uppercase tracking-[0.14em] text-fg/75">
                      {formatMoney(product.priceCents)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setOpenProductId((current) =>
                            current === product.id ? null : product.id
                          )
                        }
                        className="h-9 rounded-xl border border-border bg-bg px-3 text-[11px] font-black uppercase tracking-[0.16em] text-fg transition hover:bg-muted"
                      >
                        {isOpen ? "Masquer" : "Details"}
                      </button>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex h-9 items-center rounded-xl border border-border bg-fg px-3 text-[11px] font-black uppercase tracking-[0.16em] text-bg transition hover:bg-fg/90"
                      >
                        Editer
                      </Link>
                    </div>
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-4 grid gap-2 border-t border-border/70 pt-4">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="grid gap-2 rounded-xl border border-border bg-bg p-3 md:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-fg/20"
                              style={{ backgroundColor: variant.colorHex ?? "#0a0a0a" }}
                            />
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-fg/75">
                              {variant.colorName}
                            </span>
                            <span className="text-[11px] uppercase tracking-[0.14em] text-fg/45">
                              Stock {variant.totalStock}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.13em] text-fg/45">
                            {variant.stock
                              .map((item) => `${item.size}:${item.quantity}`)
                              .join(" • ")}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {variant.images.slice(0, 5).map((url, index) => (
                            <div
                              key={`${variant.id}-${url}-${index}`}
                              className="relative h-6 w-6 overflow-hidden rounded-md bg-muted"
                            >
                              <Image
                                src={url}
                                alt={variant.colorName}
                                fill
                                sizes="24px"
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {variant.images.length > 5 ? (
                            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-fg/45">
                              +{variant.images.length - 5}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
