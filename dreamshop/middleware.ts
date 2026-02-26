import { NextResponse, type NextRequest } from "next/server";
import { adminCookieName, isAdminAuthDisabled } from "./src/lib/auth";
import { isMaintenanceModeEnabled } from "./src/lib/site-flags";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isBypassPath(pathname)) return NextResponse.next();

  if (isMaintenanceModeEnabled()) {
    if (pathname === "/maintenance") return NextResponse.next();
    if (pathname.startsWith("/api/") && !isAdminRoute) {
      return NextResponse.json(
        { error: "Maintenance en cours. Revenez bientot." },
        { status: 503 }
      );
    }
    if (!isAdminRoute) {
      const url = req.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (!isAdminRoute) return NextResponse.next();
  if (isAdminAuthDisabled()) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = req.cookies.get(adminCookieName)?.value;
  if (!token) return handleUnauthorized(req);
  // Token verification happens in server routes/layout to avoid edge/env mismatch.
  return NextResponse.next();
}

function isBypassPath(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
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
  matcher: ["/((?!_next/static|_next/image).*)"],
};
