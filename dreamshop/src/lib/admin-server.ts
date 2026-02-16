import "server-only";

import { cookies } from "next/headers";
import { adminCookieName, verifyAdminToken } from "@/lib/auth";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;
  if (!token) return null;
  try {
    await verifyAdminToken(token);
    return { label: "Admin" };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  cookieStore.set(adminCookieName, "", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    secure: isProd,
    maxAge: 0,
  });
}
