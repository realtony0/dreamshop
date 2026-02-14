import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    priceCents: number;
    category?: "HOODIE" | "SET";
    variants?: {
      colorName: string;
      colorHex: string | null;
      images?: { url: string; alt: string | null }[];
    }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const variants = product.variants ?? [];
  const first = variants[0];
  const image1 = first?.images?.[0];
  const image2 = first?.images?.[1];
  const label =
    variants.length > 1
      ? `${variants.length} couleurs`
      : first?.colorName ?? (product.category === "SET" ? "Ensemble" : "Piece");

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-500 hover:shadow-2xl",
        "ring-1 ring-border/50"
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {image1 ? (
          <>
            <Image
              src={image1.url}
              alt={image1.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                "object-cover transition-transform duration-700",
                image2 ? "group-hover:scale-105" : "group-hover:scale-110"
              )}
              priority={false}
            />
            {image2 ? (
              <Image
                src={image2.url}
                alt={image2.alt ?? product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                priority={false}
              />
            ) : null}
          </>
        ) : null}

        <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/20" />
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black shadow-lg">
            Voir le produit <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-accent">
            {label}
          </span>
          {variants.length > 1 ? (
            <div className="flex items-center gap-1">
              {variants.slice(0, 4).map((v) => (
                <span
                  key={v.colorName}
                  className="h-3 w-3 rounded-full ring-1 ring-black/10"
                  style={v.colorHex ? { backgroundColor: v.colorHex } : undefined}
                  aria-label={v.colorName}
                />
              ))}
              {variants.length > 4 ? (
                <span className="ml-1 text-xs font-bold text-fg/45">
                  +{variants.length - 4}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <h3 className="clamp-2 text-base font-bold text-fg transition-colors group-hover:text-accent md:text-lg">
          {product.name}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-black text-fg md:text-2xl">
            {formatMoney(product.priceCents)}
          </span>
        </div>
      </div>
    </Link>
  );
}
