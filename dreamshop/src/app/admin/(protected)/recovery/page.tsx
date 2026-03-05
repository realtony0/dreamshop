import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ImageRecoveryPanel } from "@/components/admin/image-recovery-panel";

function isBlobAdminUrl(url: string) {
  return url.includes(".public.blob.vercel-storage.com/admin/");
}

export default async function AdminRecoveryPage() {
  const productImages = await prisma.productImage.findMany({
    select: {
      url: true,
      variant: {
        select: {
          colorName: true,
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { sort: "asc" },
  });

  const map = new Map<
    string,
    {
      url: string;
      productName: string;
      colorName: string;
    }
  >();

  for (const image of productImages) {
    if (!isBlobAdminUrl(image.url)) continue;
    if (map.has(image.url)) continue;
    map.set(image.url, {
      url: image.url,
      productName: image.variant.product.name,
      colorName: image.variant.colorName,
    });
  }

  const items = [...map.values()];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-fg/60">
            Admin
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-fg md:text-4xl">
            Récupération des images
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-fg/65">
            Outil de secours pour remettre en ligne les images supprimées depuis le cache du
            navigateur.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex h-10 items-center rounded-lg border border-border bg-bg px-3 text-[11px] font-black uppercase tracking-[0.14em] text-fg/75 transition hover:bg-muted hover:text-fg"
        >
          Retour produits
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-bg px-5 py-4 text-sm text-fg/70">
        URLs ciblées : <span className="font-black text-fg">{items.length}</span>
      </div>

      <ImageRecoveryPanel items={items} />
    </div>
  );
}
