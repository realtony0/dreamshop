import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminCookieName,
  getExpectedAdminCode,
  isAdminAuthDisabled,
  verifyAdminToken,
} from "@/lib/auth";

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

  return NextResponse.json(
    {
      ok: false,
      error:
        "Ajout temporairement indisponible : stockage sature. Reessaie plus tard.",
    },
    { status: 503 }
  );
}
