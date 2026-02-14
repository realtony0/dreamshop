import { notFound } from "next/navigation";
import { ProductEditor, type ProductDraft } from "@/components/admin/product-editor";
import { prisma } from "@/lib/prisma";
import { sizes } from "@/lib/sizes";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { updatedAt: "desc" },
        include: {
          images: { orderBy: { sort: "asc" } },
          stock: { orderBy: { size: "asc" } },
        },
      },
    },
  });

  if (!product) notFound();

  const initial: ProductDraft = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    price: String(product.priceCents),
    featured: product.featured,
    active: product.active,
    variants: product.variants.map((v) => ({
      colorName: v.colorName,
      colorHex: v.colorHex ?? "",
      images: v.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
      stock: Object.fromEntries(
        sizes.map((s) => [s, v.stock.find((x) => x.size === s)?.quantity ?? 0])
      ) as ProductDraft["variants"][number]["stock"],
    })),
  };

  return <ProductEditor productId={product.id} initial={initial} />;
}
