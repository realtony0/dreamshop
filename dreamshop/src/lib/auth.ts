import { SignJWT, jwtVerify } from "jose";

export const adminCookieName = "ds_admin";

const adminSessionDays = 14;
type AdminTokenPayload = {
  admin?: true;
  email?: string;
};

export function isAdminAuthDisabled() {
  return (process.env.ADMIN_AUTH_DISABLED ?? "false").trim() === "true";
}

function getAdminSessionSecret() {
  const secret = (
    process.env.ADMIN_SESSION_SECRET ?? "dev-only-change-me-admin-session-secret"
  ).trim();
  return new TextEncoder().encode(secret);
}

export function getExpectedAdminCode() {
  return (process.env.ADMIN_CODE ?? "150803").trim();
}

export async function createAdminToken() {
  return await new SignJWT({ admin: true } satisfies AdminTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${adminSessionDays}d`)
    .sign(getAdminSessionSecret());
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify<AdminTokenPayload>(token, getAdminSessionSecret());
  if (!payload.admin && !payload.email) {
    throw new Error("INVALID_ADMIN_TOKEN");
  }
  return payload;
}
