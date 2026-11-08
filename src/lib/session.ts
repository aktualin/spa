import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "kama_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 jam kerja

/**
 * Login admin dimatikan sementara (permintaan user 9 Nov 2026): siapa pun yang
 * membuka /admin langsung masuk sebagai admin. Proxy melewati guard, dan
 * `getSession()` mengembalikan sesi ADMIN dari akun aktif pertama di database.
 * Ubah ke `false` untuk mengaktifkan login kembali — tidak ada kode lain yang
 * perlu disentuh.
 */
export const ADMIN_AUTH_DISABLED = true;

export type AdminRoleName = "ADMIN" | "EDITOR";

export type SessionPayload = {
  userId: string;
  email: string;
  role: AdminRoleName;
  /** Harus sama dengan `AdminUser.sessionVersion`; beda = sesi sudah dicabut. */
  sessionVersion: number;
  mustChangePassword: boolean;
};

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET belum diset di .env.local (minimal 32 karakter)",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    sv: payload.sessionVersion,
    mcp: payload.mustChangePassword,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

// Dipakai juga dari proxy (Edge runtime), jadi tidak boleh menyentuh Prisma.
// Pencocokan sessionVersion dengan database dilakukan di src/lib/auth.ts.
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    const role = payload.role;
    if (!payload.sub || (role !== "ADMIN" && role !== "EDITOR")) return null;
    if (typeof payload.sv !== "number") return null;

    return {
      userId: payload.sub,
      email: String(payload.email ?? ""),
      role,
      sessionVersion: payload.sv,
      mustChangePassword: payload.mcp === true,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
