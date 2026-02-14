import { prisma } from "@/lib/prisma";

export type ShopFilters = {
  category?: "HOODIE" | "SET";
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function getFeaturedProducts(limit = 6) {
  return await prisma.product.findMany({
    where: { active: true, featured: true },
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: {
      variants: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { images: { orderBy: { sort: "asc" }, take: 2 } },
      },
    },
  });
}

export async function getProducts(filters: ShopFilters = {}) {
  const { category, size, color, minPrice, maxPrice } = filters;

  return await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(color
        ? {
            variants: {
              some: { colorName: { equals: color } },
            },
          }
        : {}),
      ...(size
        ? {
            variants: {
              some: { stock: { some: { size, quantity: { gt: 0 } } } },
            },
          }
        : {}),
      ...(typeof minPrice === "number"
        ? { priceCents: { gte: Math.round(minPrice) } }
        : {}),
      ...(typeof maxPrice === "number"
        ? { priceCents: { lte: Math.round(maxPrice) } }
        : {}),
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    include: {
      variants: {
        orderBy: { updatedAt: "desc" },
        include: { images: { orderBy: { sort: "asc" }, take: 2 } },
      },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
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
}
