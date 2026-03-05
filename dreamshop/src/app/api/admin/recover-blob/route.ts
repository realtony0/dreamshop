import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import {
  adminCookieName,
  getExpectedAdminCode,
  isAdminAuthDisabled,
  verifyAdminToken,
} from "@/lib/auth";

export const runtime = "nodejs";

const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

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

function getBlobPathname(originalUrl: string) {
  const parsed = new URL(originalUrl);
  if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
    return null;
  }
  const pathname = parsed.pathname.replace(/^\/+/, "");
  if (!pathname) return null;
  return pathname;
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!blobToken) {
    return NextResponse.json(
      { ok: false, error: "BLOB_READ_WRITE_TOKEN manquant." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Form-data invalide." }, { status: 400 });
  }

  const originalUrl = String(formData.get("originalUrl") ?? "").trim();
  const file = formData.get("file");

  if (!originalUrl) {
    return NextResponse.json(
      { ok: false, error: "originalUrl manquant." },
      { status: 400 }
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant." }, { status: 400 });
  }

  const pathname = getBlobPathname(originalUrl);
  if (!pathname) {
    return NextResponse.json(
      { ok: false, error: "URL blob invalide." },
      { status: 400 }
    );
  }

  try {
    const restored = await put(pathname, file, {
      token: blobToken,
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "image/jpeg",
      allowOverwrite: true,
    });
    return NextResponse.json({ ok: true, url: restored.url, pathname });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Restauration blob impossible." },
      { status: 500 }
    );
  }
}
