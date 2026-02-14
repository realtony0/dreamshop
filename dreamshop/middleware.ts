import { NextResponse, type NextRequest } from "next/server";
import { adminCookieName, verifyAdminToken } from "./src/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = req.cookies.get(adminCookieName)?.value;
  if (!token) return handleUnauthorized(req);

  try {
    await verifyAdminToken(token);
    return NextResponse.next();
  } catch {
    return handleUnauthorized(req);
  }
}

function handleUnauthorized(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
