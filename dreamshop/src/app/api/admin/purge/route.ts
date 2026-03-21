import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const deleted = await prisma.product.deleteMany({});
  revalidatePath("/shop");
  revalidatePath("/");
  return NextResponse.json({ ok: true, deleted: deleted.count });
}
