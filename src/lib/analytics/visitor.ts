import { randomUUID } from "node:crypto";

/** Umur cookie pengunjung: satu tahun. */
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const VISITOR_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ID acak dari cookie; null bila belum ada atau formatnya tidak dikenal. */
export function readVisitorId(value: string | undefined): string | null {
  return value && VISITOR_ID_PATTERN.test(value) ? value : null;
}

export function newVisitorId(): string {
  return randomUUID();
}

/** Opsi cookie yang sama untuk proxy (muat penuh) dan API (navigasi client). */
export function visitorCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
  };
}
