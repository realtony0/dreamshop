import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    // Delete in order to respect foreign keys (Turso doesn't cascade automatically)
    const images = await prisma.productImage.deleteMany({});
    const stock = await prisma.stockItem.deleteMany({});
    const variants = await prisma.productVariant.deleteMany({});
    const products = await prisma.product.deleteMany({});
    revalidatePath("/shop");
    revalidatePath("/");
    return NextResponse.json({
      ok: true,
      deleted: { products: products.count, variants: variants.count, images: images.count, stock: stock.count },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
