"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminCookieName,
  createAdminToken,
  getAdminIdentityEmail,
  getExpectedAdminCode,
} from "@/lib/auth";

export type AdminLoginState = { error?: string };

function safeNext(value: unknown) {
  const next = typeof value === "string" ? value : "/admin";
  if (!next.startsWith("/")) return "/admin";
  if (next.startsWith("//")) return "/admin";
  return next;
}

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const code = String(formData.get("code") ?? "").trim();
  const expectedCode = getExpectedAdminCode();

  if (code !== expectedCode) {
    return { error: "Code incorrect." };
  }

  const email = getAdminIdentityEmail();
  const token = await createAdminToken({ email });
  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(safeNext(formData.get("next")));
}
