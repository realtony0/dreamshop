import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { Container } from "@/components/site/container";
import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];

function parseMoney(value: unknown) {
  if (typeof value !== "string") return undefined;
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isFinite(n) ? n : undefined;
}

function buildShopHref(filters: {
  category?: string;
  size?: string;
  color?: string;
  min?: string;
  max?: string;
}) {
  const sp = new URLSearchParams();
  if (filters.category) sp.set("category", filters.category);
  if (filters.size) sp.set("size", filters.size);
  if (filters.color) sp.set("color", filters.color);
  if (filters.min) sp.set("min", filters.min);
  if (filters.max) sp.set("max", filters.max);
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const category =
    typeof sp.category === "string" && (sp.category === "HOODIE" || sp.category === "SET")
      ? sp.category
      : undefined;
  const size = typeof sp.size === "string" ? sp.size : undefined;
  const color = typeof sp.color === "string" ? sp.color : undefined;
  const minPrice = parseMoney(sp.min);
  const maxPrice = parseMoney(sp.max);

  const [products, colorsRaw, sizesRaw] = await Promise.all([
    getProducts({ category, size, color, minPrice, maxPrice }),
    prisma.productVariant.findMany({
      where: {
        product: { active: true, ...(category ? { category } : {}) },
      },
      select: { colorName: true },
      distinct: ["colorName"],
      orderBy: { colorName: "asc" },
    }),
    prisma.stockItem.findMany({
      where: {
        variant: { product: { active: true, ...(category ? { category } : {}) } },
      },
      select: { size: true },
      distinct: ["size"],
    }),
  ] as const);

  const colors = colorsRaw.map((c) => c.colorName).filter(Boolean);
  const sizes = sizesRaw
    .map((s) => s.size)
    .filter(Boolean)
    .sort((a, b) => {
      const ai = sizeOrder.indexOf(a);
      const bi = sizeOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  const hasFilters = Boolean(category || size || color || minPrice || maxPrice);
  const min = typeof minPrice === "number" ? String(minPrice) : undefined;
  const max = typeof maxPrice === "number" ? String(maxPrice) : undefined;

  return (
    <div className="py-12 md:py-16">
      <Container>
        <div className="flex flex-col gap-3">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-fg/60">
            Boutique
          </div>
          <div className="flex items-end justify-between gap-6">
            <h1 className="text-4xl font-black tracking-tight text-fg md:text-5xl">
              Drops
            </h1>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/60">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </div>
          </div>

          {hasFilters ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/50">
                Filtres:
              </div>
              {category ? (
                <Link
                  href={buildShopHref({ category: undefined, size, color, min, max })}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-fg/70 transition hover:bg-muted/70"
                >
                  {category === "HOODIE" ? "Pieces" : "Ensembles"} ×
                </Link>
              ) : null}
              {size ? (
                <Link
                  href={buildShopHref({ category, size: undefined, color, min, max })}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-fg/70 transition hover:bg-muted/70"
                >
                  Taille {size} ×
                </Link>
              ) : null}
              {color ? (
                <Link
                  href={buildShopHref({ category, size, color: undefined, min, max })}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-fg/70 transition hover:bg-muted/70"
                >
                  {color} ×
                </Link>
              ) : null}
              {min ? (
                <Link
                  href={buildShopHref({ category, size, color, min: undefined, max })}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-fg/70 transition hover:bg-muted/70"
                >
                  Min {min} ×
                </Link>
              ) : null}
              {max ? (
                <Link
                  href={buildShopHref({ category, size, color, min, max: undefined })}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-fg/70 transition hover:bg-muted/70"
                >
                  Max {max} ×
                </Link>
              ) : null}
              <Link
                href="/shop"
                className="ml-1 text-xs font-black uppercase tracking-[0.22em] text-fg/55 underline underline-offset-4 hover:text-fg"
              >
                Reset
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]">
          <aside className="h-fit rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/60 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-fg/70">
                Filtres
              </div>
              {hasFilters ? (
                <Link
                  href="/shop"
                  className="text-xs font-black uppercase tracking-[0.22em] text-fg/60 hover:text-fg"
                >
                  Reset
                </Link>
              ) : null}
            </div>

            <form className="mt-6 grid gap-5" method="get">
              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                  Catégorie
                </label>
                <select
                  name="category"
                  defaultValue={category ?? ""}
                  className="h-11 w-full rounded-xl border border-border bg-bg px-4 text-sm font-medium text-fg transition focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="">Tout</option>
                  <option value="HOODIE">Pieces</option>
                  <option value="SET">Ensembles</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                  Taille
                </label>
                <select
                  name="size"
                  defaultValue={size ?? ""}
                  className="h-11 w-full rounded-xl border border-border bg-bg px-4 text-sm font-medium text-fg transition focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="">Toutes</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                  Couleur
                </label>
                <select
                  name="color"
                  defaultValue={color ?? ""}
                  className="h-11 w-full rounded-xl border border-border bg-bg px-4 text-sm font-medium text-fg transition focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="">Toutes</option>
                  {colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                    Prix min
                  </label>
                <input
                  name="min"
                  inputMode="numeric"
                  placeholder="30000"
                  defaultValue={typeof minPrice === "number" ? String(minPrice) : ""}
                  className="h-11 w-full rounded-xl border border-border bg-bg px-4 text-sm font-medium text-fg placeholder:text-fg/40 transition focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-black uppercase tracking-[0.18em] text-fg/60">
                  Prix max
                </label>
                <input
                  name="max"
                  inputMode="numeric"
                  placeholder="60000"
                  defaultValue={typeof maxPrice === "number" ? String(maxPrice) : ""}
                  className="h-11 w-full rounded-xl border border-border bg-bg px-4 text-sm font-medium text-fg placeholder:text-fg/40 transition focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>

              <button className="mt-1 h-11 rounded-xl border border-border bg-fg text-sm font-black uppercase tracking-wider text-bg transition hover:bg-fg/90 focus:outline-none focus:ring-2 focus:ring-accent/30">
                Appliquer
              </button>
            </form>
          </aside>

        <section>
          {products.length === 0 ? (
            <div className="rounded-2xl bg-card p-10 text-sm text-fg/70 shadow-sm ring-1 ring-border/60">
              Aucun produit ne correspond à ces filtres.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
      </Container>
    </div>
  );
}
