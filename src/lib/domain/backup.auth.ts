/** Autentikasi laporan backup otomatis — lihat `backup.ts`. */
import { createHash, timingSafeEqual } from "node:crypto";

import { MIN_REPORT_SECRET_LENGTH } from "./backup.constants.ts";

/** Secret dianggap terpasang hanya bila cukup panjang (mencegah secret lemah/kosong). */
export function isReportSecretConfigured(secret: string | undefined | null): secret is string {
  return typeof secret === "string" && secret.trim().length >= MIN_REPORT_SECRET_LENGTH;
}

/** Ambil token dari header `Authorization: Bearer <token>`. */
export function extractBearerToken(header: string | null | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer[ \t]+(\S+)[ \t]*$/i.exec(header);
  return match ? match[1] : null;
}

/** Perbandingan konstan-waktu; panjang berbeda tidak membocorkan informasi karena keduanya di-hash dulu. */
export function constantTimeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a, "utf8").digest();
  const right = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(left, right);
}

/**
 * true hanya bila secret server terpasang (≥ 32 karakter) DAN header membawa
 * token yang sama persis. Secret kosong → selalu ditolak (fail-closed).
 */
export function isReportAuthorized(
  authorizationHeader: string | null | undefined,
  secret: string | undefined | null,
): boolean {
  if (!isReportSecretConfigured(secret)) return false;
  const token = extractBearerToken(authorizationHeader);
  if (!token) return false;
  return constantTimeEqual(token, secret.trim());
}