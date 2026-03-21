import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken:
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN ?? undefined,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Remove all existing products (cascading deletes variants, images, stock)
  const deleted = await prisma.product.deleteMany({});
  console.log(`Deleted ${deleted.count} existing product(s).`);
  console.log("Database is now clean — add products via the admin panel.");
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
