import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function parseArgs(argv) {
  const out = {
    report: "./import/photos-report.json",
    onlyPrefix: "import-",
    reset: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--report") out.report = argv[++i];
    else if (a === "--only-prefix") out.onlyPrefix = argv[++i];
    else if (a === "--reset") out.reset = true;
  }
  return out;
}

const args = parseArgs(process.argv);
const reportPath = path.resolve(process.cwd(), args.report);

const raw = await fs.readFile(reportPath, "utf8");
const report = JSON.parse(raw);

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken:
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN ?? undefined,
});
const prisma = new PrismaClient({ adapter });

const defaultStock = [
  { size: "XS", quantity: 2 },
  { size: "S", quantity: 4 },
  { size: "M", quantity: 6 },
  { size: "L", quantity: 6 },
  { size: "XL", quantity: 4 },
  { size: "XXL", quantity: 2 },
];

function priceForCategory(category) {
  return category === "SET" ? 30000 : 30000;
}

function nameFor(category, index) {
  const n = String(index).padStart(2, "0");
  return category === "SET" ? `Lulelemon Set ${n}` : `Piece ${n}`;
}

function descriptionFor(category) {
  return category === "SET"
    ? "Ensemble premium (haut + bas). Silhouette clean, confort max. Stock par taille — drop limite."
    : "Piece premium streetwear. Finitions clean, coupe moderne, stock par taille.";
}

function toNonEmptyString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toPositiveInteger(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  return rounded > 0 ? rounded : null;
}

function hexToRgb(hex) {
  if (typeof hex !== "string") return null;
  const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance({ r, g, b }) {
  // Relative luminance (sRGB).
  const toLinear = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function stripSuffixNumber(name) {
  return String(name ?? "").replace(/\s+\d+$/, "").trim();
}

function polishedVariants(variants) {
  const groups = new Map();
  for (const v of variants) {
    const base = stripSuffixNumber(v.colorName);
    const rgb = hexToRgb(v.colorHex);
    const lum = rgb ? luminance(rgb) : 0.5;
    const key = base || "Couleur";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...v, _lum: lum, _base: key });
  }

  const out = [];
  for (const [base, list] of groups.entries()) {
    const sorted = [...list].sort((a, b) => a._lum - b._lum);
    const n = sorted.length;
    for (let i = 0; i < n; i++) {
      const item = sorted[i];
      let nextName = base || "Couleur";
      if (n === 2) {
        nextName = i === 0 ? `${base} Foncé` : `${base} Clair`;
      } else if (n === 3) {
        nextName =
          i === 0 ? `${base} Foncé` : i === 1 ? `${base} Moyen` : `${base} Clair`;
      } else if (n > 3) {
        nextName = `${base} ${i + 1}`;
      }
      out.push({
        ...item,
        colorName: nextName,
      });
    }
  }

  // Ensure uniqueness within product (Prisma unique [productId, colorName]).
  const used = new Map();
  return out.map((v) => {
    const base = v.colorName || "Couleur";
    used.set(base, (used.get(base) ?? 0) + 1);
    const count = used.get(base);
    return {
      ...v,
      colorName: count === 1 ? base : `${base} ${count}`,
    };
  });
}

try {
  if (args.reset) {
    await prisma.product.deleteMany({
      where: { slug: { startsWith: args.onlyPrefix } },
    });
  }

  let hoodieIndex = 0;
  let setIndex = 0;

  for (const p of report.products ?? []) {
    if (typeof p.slug !== "string" || !p.slug.startsWith(args.onlyPrefix)) continue;
    const category = p.category === "SET" ? "SET" : "HOODIE";

    if (category === "SET") setIndex += 1;
    else hoodieIndex += 1;

    const idx = category === "SET" ? setIndex : hoodieIndex;
    const name = toNonEmptyString(p.name) ?? nameFor(category, idx);
    const description =
      toNonEmptyString(p.description) ?? descriptionFor(category);
    const priceCents = toPositiveInteger(p.priceCents) ?? priceForCategory(category);
    const featured =
      typeof p.featured === "boolean" ? p.featured : Boolean(p.sourceCount >= 6);

    const rawVariants = (p.variants ?? []).map((v) => ({
      colorName: String(v.colorName ?? "Couleur"),
      colorHex: typeof v.colorHex === "string" ? v.colorHex : null,
      images: (v.images ?? []).map((img) => ({
        url: String(img.url),
      })),
    }));

    const variants = polishedVariants(rawVariants).map((v) => ({
      colorName: v.colorName,
      colorHex: v.colorHex,
      images: {
        create: (v.images ?? []).map((img, i) => ({
          url: String(img.url),
          alt: null,
          sort: i,
        })),
      },
      stock: { create: defaultStock },
    }));

    await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name,
        description,
        category,
        priceCents,
        featured,
        active: true,
        variants: { create: variants },
      },
      update: {
        name,
        description,
        category,
        priceCents,
        featured,
        active: true,
        variants: {
          deleteMany: {},
          create: variants,
        },
      },
    });
  }
} finally {
  await prisma.$disconnect();
}

console.log("Import OK");
