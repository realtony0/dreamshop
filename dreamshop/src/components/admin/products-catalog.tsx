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
type StockFilter = "ALL" | "IN_STOCK" | "LOW" | "OUT";

const lowStockThreshold = 3;

function categoryLabel(category: "HOODIE" | "SET") {
  return category === "HOODIE" ? "Piece" : "Ensemble";
}

function stockState(totalStock: number): StockFilter {
  if (totalStock === 0) return "OUT";
  if (totalStock <= lowStockThreshold) return "LOW";
  return "IN_STOCK";
}

function stockLabel(totalStock: number) {
  const state = stockState(totalStock);
  if (state === "OUT") return "Rupture";
  if (state === "LOW") return `Stock faible (${totalStock})`;
  return `En stock (${totalStock})`;
}

export function AdminProductsCatalog({
  products,
}: {
  products: AdminCatalogProduct[];
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<CategoryFilter>("ALL");
  const [stockFilter, setStockFilter] = React.useState<StockFilter>("ALL");

  const filtered = React.useMemo(() => {
    const value = query.trim().toLowerCase();

    return products.filter((product) => {
      if (category !== "ALL" && product.category !== category) return false;
      if (stockFilter !== "ALL" && stockState(product.totalStock) !== stockFilter) return false;

      if (!value) return true;

      const inTitle =
        product.name.toLowerCase().includes(value) || product.slug.toLowerCase().includes(value);
      if (inTitle) return true;

      return product.variants.some((variant) =>
        variant.colorName.toLowerCase().includes(value)
      );
    });
  }, [category, products, query, stockFilter]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-fg/55">
            Boutique admin
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-fg md:text-4xl">
            Produits
          </h1>
          <p className="mt-2 text-sm text-fg/65">
            Ecran simplifie: chercher, filtrer, editer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-bg px-4 text-xs font-black uppercase tracking-[0.16em] text-fg transition hover:bg-muted"
          >
            Voir boutique
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-fg px-4 text-xs font-black uppercase tracking-[0.16em] text-bg transition hover:bg-fg/90"
          >
            Ajouter produit
          </Link>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50 md:grid-cols-[1fr_200px_200px_auto] md:items-end">
        <div className="grid gap-2">
          <label
            htmlFor="admin-product-search"
            className="text-xs font-black uppercase tracking-[0.16em] text-fg/55"
          >
            Recherche
          </label>
          <input
            id="admin-product-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, slug, couleur"
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none transition focus:ring-2 focus:ring-accent/35"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="admin-product-category"
            className="text-xs font-black uppercase tracking-[0.16em] text-fg/55"
          >
            Type
          </label>
          <select
            id="admin-product-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as CategoryFilter)}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none transition focus:ring-2 focus:ring-accent/35"
          >
            <option value="ALL">Tous</option>
            <option value="HOODIE">Pieces</option>
            <option value="SET">Ensembles</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="admin-product-stock"
            className="text-xs font-black uppercase tracking-[0.16em] text-fg/55"
          >
            Stock
          </label>
          <select
            id="admin-product-stock"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value as StockFilter)}
            className="h-11 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none transition focus:ring-2 focus:ring-accent/35"
          >
            <option value="ALL">Tous</option>
            <option value="IN_STOCK">En stock</option>
            <option value="LOW">Stock faible</option>
            <option value="OUT">Rupture</option>
          </select>
        </div>

        <div className="pb-1 text-right text-xs font-black uppercase tracking-[0.16em] text-fg/60">
          {filtered.length} produit{filtered.length > 1 ? "s" : ""}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-sm text-fg/65 shadow-sm ring-1 ring-border/50">
          Aucun produit pour ce filtre.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/50 md:block">
            <div className="grid grid-cols-[2fr_0.8fr_0.9fr_1fr_0.9fr_0.8fr] gap-4 border-b border-border px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-fg/55">
              <div>Produit</div>
              <div>Type</div>
              <div>Prix</div>
              <div>Stock</div>
              <div>Etat</div>
              <div className="text-right">Action</div>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[2fr_0.8fr_0.9fr_1fr_0.9fr_0.8fr] items-center gap-4 px-5 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-muted">
                      {product.coverImage ? (
                        <Image
                          src={product.coverImage}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-fg">{product.name}</div>
                      <div className="truncate text-xs uppercase tracking-[0.14em] text-fg/50">
                        {product.slug} • {product.imageCount} photo
                        {product.imageCount > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-black uppercase tracking-[0.14em] text-fg/65">
                    {categoryLabel(product.category)}
                  </div>

                  <div className="text-xs font-black uppercase tracking-[0.14em] text-fg/65">
                    {formatMoney(product.priceCents)}
                  </div>

                  <div className="text-xs font-black uppercase tracking-[0.14em] text-fg/65">
                    {stockLabel(product.totalStock)}
                  </div>

                  <div>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
                        product.active
                          ? "border-border bg-bg text-fg/80"
                          : "border-border bg-bg text-fg/45"
                      )}
                    >
                      {product.active ? "Actif" : "Cache"}
                    </span>
                  </div>

                  <div className="text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-bg px-3 text-[11px] font-black uppercase tracking-[0.14em] text-fg transition hover:bg-muted"
                    >
                      Editer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {filtered.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/50"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted">
                    {product.coverImage ? (
                      <Image
                        src={product.coverImage}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-black text-fg">{product.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-fg/55">
                      {categoryLabel(product.category)} • {formatMoney(product.priceCents)}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-fg/55">
                      {stockLabel(product.totalStock)} • {product.active ? "Actif" : "Cache"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-fg/45">
                    {product.imageCount} photo{product.imageCount > 1 ? "s" : ""}
                  </div>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-bg px-3 text-[11px] font-black uppercase tracking-[0.14em] text-fg transition hover:bg-muted"
                  >
                    Editer
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
