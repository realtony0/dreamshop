import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

function stock(qtys) {
  return sizes.map((size) => ({
    size,
    quantity: Math.max(0, Number(qtys[size] ?? 0)),
  }));
}

function images(urls) {
  return urls.map((url, idx) => ({ url, sort: idx, alt: null }));
}

async function upsertProduct(data) {
  const { slug, ...rest } = data;
  return await prisma.product.upsert({
    where: { slug },
    create: {
      slug,
      ...rest,
    },
    update: {
      ...rest,
      variants: {
        deleteMany: {},
        create: rest.variants.create,
      },
    },
  });
}

async function main() {
  await upsertProduct({
    slug: "hoodie-tech-fleece",
    name: "Hoodie Tech Fleece",
    description:
      "Coupe clean, confort premium. Molleton dense, finitions minimalistes. Drop limité — stock par taille.",
    category: "HOODIE",
    priceCents: 20000,
    featured: true,
    active: true,
    variants: {
      create: [
        {
          colorName: "Noir",
          colorHex: "#0a0a0a",
          images: {
            create: images([
              "/products/hoodie-obsidian-1.jpg",
              "/products/hoodie-obsidian-2.jpg",
              "/products/hoodie-obsidian-3.jpg",
            ]),
          },
          stock: {
            create: stock({ XS: 2, S: 5, M: 7, L: 6, XL: 3, XXL: 1 }),
          },
        },
        {
          colorName: "Gris",
          colorHex: "#a3a3a3",
          images: {
            create: images([
              "/products/hoodie-ash-1.jpg",
              "/products/hoodie-ash-2.jpg",
            ]),
          },
          stock: {
            create: stock({ XS: 1, S: 3, M: 5, L: 4, XL: 2, XXL: 0 }),
          },
        },
      ],
    },
  });

  await upsertProduct({
    slug: "ensemble-tech-fleece",
    name: "Lululemon Tech Set",
    description:
      "Ensemble veste + pantalon. Ligne premium street, coupe moderne et confort au quotidien.",
    category: "SET",
    priceCents: 30000,
    featured: true,
    active: true,
    variants: {
      create: [
        {
          colorName: "Graphite",
          colorHex: "#111827",
          images: {
            create: images([
              "/products/set-graphite-1.jpg",
              "/products/set-graphite-2.jpg",
              "/products/set-graphite-3.jpg",
            ]),
          },
          stock: {
            create: stock({ XS: 1, S: 3, M: 6, L: 5, XL: 2, XXL: 0 }),
          },
        },
        {
          colorName: "Sand",
          colorHex: "#d6c2a3",
          images: {
            create: images([
              "/products/set-sand-1.jpg",
              "/products/set-sand-2.jpg",
              "/products/set-sand-3.jpg",
            ]),
          },
          stock: {
            create: stock({ XS: 0, S: 2, M: 4, L: 4, XL: 2, XXL: 1 }),
          },
        },
      ],
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
