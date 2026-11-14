import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { isBotSubmission } from "@/lib/domain/forms";
import { extractClientIp } from "@/lib/domain/inquiry";
import type { RateLimiter } from "@/lib/domain/rate-limit";
import { isSameOrigin } from "@/lib/domain/same-origin";

/**
 * Pertahanan bersama endpoint formulir publik (reservation, newsletter,
 * corporate-inquiry, backup/report): respons JSON no-store, kunci rate limit
 * hash IP, origin check, dan parsing body. Data pribadi pengirim tidak pernah
 * ditulis ke log.
 */

export function json(body: Record<string, unknown>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", ...(headers ?? {}) },
  });
}

/** Kunci rate limit: hash IP (IP mentah tidak disimpan di memori sekalipun). */
export function rateLimitKey(scope: string, ip: string): string {
  return createHash("sha256").update(`${scope}:${ip}`).digest("hex").slice(0, 32);
}

/** Kode galat ringkas untuk log — tanpa pesan/argumen yang bisa memuat PII. */
export function errorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code);
  }
  return error instanceof Error ? error.name : "unknown";
}

/**
 * Lapis pertama: origin harus situs ini, lalu rate limit per IP.
 * Mengembalikan respons penolakan, atau null bila lolos.
 */
export function guardFormRequest(
  request: Request,
  limiter: RateLimiter,
  scope: string,
): NextResponse | null {
  if (!isSameOrigin(request.headers)) {
    return json({ error: "Permintaan tidak diizinkan." }, 403);
  }

  const limit = limiter.check(rateLimitKey(scope, extractClientIp(request.headers)));
  if (!limit.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil(limit.retryAfterMs / 1000));
    return json(
      { error: "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit." },
      429,
      { "retry-after": String(retryAfterSeconds) },
    );
  }
  return null;
}

/** Body JSON objek dengan batas ukuran; respons galat bila tidak valid. */
export async function parseFormBody(
  request: Request,
  maxBody: number,
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; response: NextResponse }> {
  try {
    const raw = await request.text();
    if (raw.length > maxBody) {
      return { ok: false, response: json({ error: "Isian terlalu panjang." }, 413) };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bukan objek");
    return { ok: true, body: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, response: json({ error: "Body permintaan tidak valid." }, 400) };
  }
}

/** Honeypot terisi / tanpa elapsedMs / terlalu cepat → sukses palsu, jangan simpan. */
export function isBotBody(body: Record<string, unknown>): boolean {
  const website = typeof body.website === "string" ? body.website : "";
  const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : 0;
  return isBotSubmission({ website, elapsedMs });
}