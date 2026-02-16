import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminCookieName,
  getExpectedAdminCode,
  isAdminAuthDisabled,
  verifyAdminToken,
} from "@/lib/auth";

export const runtime = "nodejs";

const maxFileSize = 10 * 1024 * 1024;
const allowedMimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

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

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Form-data invalide." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, error: "Le fichier doit être une image." },
      { status: 400 }
    );
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { ok: false, error: "Image trop lourde (max 10MB)." },
      { status: 400 }
    );
  }

  const extFromName = path.extname(file.name || "").toLowerCase();
  const ext = allowedMimeToExt[file.type] ?? (extFromName || ".jpg");

  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const relativeDir = path.join("uploads", "admin");
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  const absolutePath = path.join(absoluteDir, fileName);
  const publicUrl = `/${relativeDir.replaceAll(path.sep, "/")}/${fileName}`;

  try {
    await mkdir(absoluteDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(absolutePath, Buffer.from(bytes));
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Upload impossible." },
      { status: 500 }
    );
  }
}
