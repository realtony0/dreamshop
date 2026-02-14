import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/store";
import { ProductDetail } from "@/components/products/product-detail";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const safeProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    category: product.category,
    variants: product.variants.map((v) => ({
      id: v.id,
      colorName: v.colorName,
      colorHex: v.colorHex,
      images: v.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        sort: img.sort,
      })),
      stock: v.stock.map((s) => ({
        id: s.id,
        size: s.size,
        quantity: s.quantity,
      })),
    })),
  };

  return <ProductDetail product={safeProduct} />;
}
