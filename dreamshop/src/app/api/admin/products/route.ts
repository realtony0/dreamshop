import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  adminCookieName,
  getExpectedAdminCode,
  isAdminAuthDisabled,
  verifyAdminToken,
} from "@/lib/auth";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const productPayloadSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(slugRegex),
  description: z.string().min(1),
  category: z.enum(["HOODIE", "SET"]),
  priceCents: z.number().int().min(0),
  featured: z.boolean(),
  active: z.boolean(),
  variants: z
    .array(
      z.object({
        colorName: z.string().min(1),
        colorHex: z.string().optional().nullable(),
        images: z
          .array(
            z.object({
              url: z.string().min(1),
              alt: z.string().optional().nullable(),
              sort: z.number().int().min(0).default(0),
            })
          )
          .min(1),
        stock: z
          .array(
            z.object({
              size: z.string().min(1),
              quantity: z.number().int().min(0),
            })
          )
          .min(1),
      })
    )
    .min(1),
});

async function requireAdmin(req: Request) {
  if (isAdminAuthDisabled()) return true;
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;
  if (token) {
    try {
      await verifyAdminToken(token);
      return true;
    } catch {
      // continue to fallback
    }
  }

  const headerCode = req.headers.get("x-admin-code")?.trim();
  if (!headerCode) return false;
  return headerCode === getExpectedAdminCode();
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide." }, { status: 400 });
  }

  const parsed = productPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Données invalides." }, { status: 400 });
  }

  try {
    const created = await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        category: parsed.data.category,
        priceCents: parsed.data.priceCents,
        featured: parsed.data.featured,
        active: parsed.data.active,
        variants: {
          create: parsed.data.variants.map((v) => ({
            colorName: v.colorName,
            colorHex: v.colorHex || null,
            images: {
              create: v.images.map((img) => ({
                url: img.url,
                alt: img.alt || null,
                sort: img.sort ?? 0,
              })),
            },
            stock: {
              create: v.stock.map((s) => ({ size: s.size, quantity: s.quantity })),
            },
          })),
        },
      },
      select: { id: true },
    });

    revalidatePath("/shop");
    revalidatePath(`/products/${parsed.data.slug}`);

    return NextResponse.json({ ok: true, id: created.id });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erreur: slug déjà utilisé ?" },
      { status: 400 }
    );
  }
}
