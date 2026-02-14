import { prisma } from "@/lib/prisma";
import {
  AdminProductsCatalog,
  type AdminCatalogProduct,
} from "@/components/admin/products-catalog";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      variants: {
        orderBy: { updatedAt: "desc" },
        include: {
          stock: { orderBy: { size: "asc" } },
          images: { orderBy: { sort: "asc" } },
        },
      },
    },
  });

  const catalog: AdminCatalogProduct[] = products.map((product) => {
    const variants = product.variants.map((variant) => ({
      id: variant.id,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      stock: variant.stock.map((item) => ({
        size: item.size,
        quantity: item.quantity,
      })),
      images: variant.images.map((image) => image.url),
      totalStock: variant.stock.reduce((sum, item) => sum + item.quantity, 0),
    }));

    const allImages = variants.flatMap((variant) => variant.images);
    const totalStock = variants.reduce((sum, variant) => sum + variant.totalStock, 0);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      priceCents: product.priceCents,
      active: product.active,
      featured: product.featured,
      totalStock,
      imageCount: allImages.length,
      coverImage: allImages[0] ?? null,
      variants,
    };
  });

  return <AdminProductsCatalog products={catalog} />;
}
