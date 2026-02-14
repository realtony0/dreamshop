import { SignJWT, jwtVerify } from "jose";

export const adminCookieName = "ds_admin";

const adminSessionDays = 14;

function getAdminSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ?? "dev-only-change-me-admin-session-secret";
  return new TextEncoder().encode(secret);
}

export function getExpectedAdminCode() {
  return process.env.ADMIN_CODE ?? "1508";
}

export function getAdminIdentityEmail() {
  return process.env.ADMIN_EMAIL ?? "admin@dreamshop.local";
}

export async function createAdminToken(payload: { email: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${adminSessionDays}d`)
    .sign(getAdminSessionSecret());
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify<{ email: string }>(
    token,
    getAdminSessionSecret()
  );
  return payload;
}
