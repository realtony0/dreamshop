import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";

const emailSchema = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine(
    (value) => value.length === 0 || z.string().email().safeParse(value).success,
    "Email invalide."
  );

const bodySchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().optional().default(""),
  firstName: z.string().trim().optional().default(""),
  lastName: z.string().trim().optional().default(""),
  phone: z.string().trim().min(1),
  address1: z.string().min(1),
  address2: z.string().trim().optional().default(""),
  postalCode: z.string().trim().optional().default(""),
  city: z.string().min(1),
  country: z.string().trim().optional().default("Sénégal"),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        size: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1),
});

function splitNameFromForm(input: string) {
  const parts = input
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Client", lastName: "Dreamshop" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Client" };
  }

  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function fallbackEmail(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return `client-${Date.now()}@dreamshop.shop`;
  return `client${digits}@dreamshop.shop`;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON invalide." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Données invalides." },
      { status: 400 }
    );
  }

  const { items, phone, address2, postalCode } = parsed.data;
  const normalizedPhone = phone.trim();
  const normalizedAddress2 = address2.trim();
  const normalizedPostalCode = postalCode.trim() || "00000";
  const normalizedCountry = parsed.data.country.trim() || "Sénégal";
  const resolvedEmail = parsed.data.email.trim() || fallbackEmail(normalizedPhone);

  const fullName =
    parsed.data.fullName.trim() ||
    `${parsed.data.firstName.trim()} ${parsed.data.lastName.trim()}`.trim();
  const resolvedName = splitNameFromForm(fullName);

  const variantIds = Array.from(new Set(items.map((i) => i.variantId)));
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, product: { active: true } },
    include: { product: true, stock: true },
  });

  if (variants.length !== variantIds.length) {
    return NextResponse.json(
      { ok: false, error: "Un article est indisponible." },
      { status: 400 }
    );
  }

  const variantById = new Map(variants.map((v) => [v.id, v]));

  let totalCents = 0;
  const orderItems: Array<{
    productId: string;
    variantId: string;
    productName: string;
    colorName: string;
    size: string;
    quantity: number;
    unitPriceCents: number;
  }> = [];

  for (const item of items) {
    const variant = variantById.get(item.variantId);
    if (!variant) {
      return NextResponse.json(
        { ok: false, error: "Un article est introuvable." },
        { status: 400 }
      );
    }

    const stock = variant.stock.find((s) => s.size === item.size);
    if (!stock || stock.quantity < item.quantity) {
      return NextResponse.json(
        {
          ok: false,
          error: `Stock insuffisant (${variant.product.name} — ${variant.colorName} — ${item.size}).`,
        },
        { status: 409 }
      );
    }

    totalCents += variant.product.priceCents * item.quantity;
    orderItems.push({
      productId: variant.productId,
      variantId: variant.id,
      productName: variant.product.name,
      colorName: variant.colorName,
      size: item.size,
      quantity: item.quantity,
      unitPriceCents: variant.product.priceCents,
    });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.stockItem.updateMany({
          where: {
            variantId: item.variantId,
            size: item.size,
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new Error("OUT_OF_STOCK");
      }

      return await tx.order.create({
        data: {
          email: resolvedEmail,
          firstName: resolvedName.firstName,
          lastName: resolvedName.lastName,
          phone: normalizedPhone || null,
          address1: parsed.data.address1,
          address2: normalizedAddress2 || null,
          postalCode: normalizedPostalCode,
          city: parsed.data.city,
          country: normalizedCountry,
          totalCents,
          items: { create: orderItems },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address1: true,
          address2: true,
          postalCode: true,
          city: true,
          country: true,
          totalCents: true,
        },
      });
    });

    const whatsappUrl = buildWhatsAppOrderUrl({
      orderId: order.id,
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      address1: order.address1,
      address2: order.address2,
      postalCode: order.postalCode,
      city: order.city,
      country: order.country,
      totalCents: order.totalCents,
      items: orderItems,
    });

    return NextResponse.json({ ok: true, orderId: order.id, whatsappUrl });
  } catch (err) {
    if (err instanceof Error && err.message === "OUT_OF_STOCK") {
      return NextResponse.json(
        { ok: false, error: "Stock insuffisant. Réessaie." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Erreur serveur. Réessaie plus tard." },
      { status: 500 }
    );
  }
}
