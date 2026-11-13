import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import {
  checkFillTime,
  generateUnsubscribeToken,
  MAX_INQUIRY_BODY,
  validateNewsletterSubscribe,
} from "@/lib/domain/newsletter";
import { extractClientIp, isHoneypotFilled } from "@/lib/domain/inquiry";
import { newsletterSubscribeLimiter } from "@/lib/domain/rate-limit";
import { isSameOrigin } from "@/lib/domain/same-origin";

/**
 * Endpoint signup newsletter (footer, semua halaman publik).
 *
 * Lapis pertahanan (sama seperti `/api/corporate-inquiry`, tanpa captcha —
 * risiko rendah untuk sekadar signup email):
 * 1. Origin harus situs ini bila header Origin ada.
 * 2. Rate limit per IP (5 permintaan / 10 menit). IP hanya dipakai sebagai
 *    kunci hash di memori — tidak pernah disimpan ke database atau log.
 * 3. Batas ukuran body.
 * 4. Honeypot `website` — terisi → balas sukses palsu tanpa menyimpan.
 * 5. Lama pengisian (`elapsedMs`, dihitung browser): tidak ada → bot (sukses
 *    palsu); < 3 detik → ditolak.
 * 6. Validasi zod.
 * 7. Upsert `NewsletterSubscriber` — re-subscribe mengaktifkan kembali baris
 *    yang sama (email tetap unik), token unsubscribe lama tetap berlaku.
 */

// Tanpa `runtime`/`dynamic`: `cacheComponents` menolak route segment config,
// dan handler POST memang selalu dijalankan per-request.

function json(body: Record<string, unknown>, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", ...(headers ?? {}) },
  });
}

/** Kunci rate limit: hash IP (IP mentah tidak disimpan di memori sekalipun). */
function rateLimitKey(ip: string): string {
  return createHash("sha256").update(`newsletter-subscribe:${ip}`).digest("hex").slice(0, 32);
}

function errorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code);
  }
  return error instanceof Error ? error.name : "unknown";
}

export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) {
    return json({ error: "Permintaan tidak diizinkan." }, 403);
  }

  const limit = newsletterSubscribeLimiter.check(rateLimitKey(extractClientIp(request.headers)));
  if (!limit.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil(limit.retryAfterMs / 1000));
    return json(
      { error: "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit." },
      429,
      { "retry-after": String(retryAfterSeconds) },
    );
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_INQUIRY_BODY) {
      return json({ error: "Isian terlalu panjang." }, 413);
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bukan objek");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Body permintaan tidak valid." }, 400);
  }

  if (isHoneypotFilled(body.website)) {
    return json({ ok: true });
  }

  const fill = checkFillTime(body.elapsedMs);
  if (fill === "missing") return json({ ok: true });
  if (fill === "too-fast") {
    return json(
      { error: "Formulir terkirim terlalu cepat. Mohon periksa isian Anda lalu kirim ulang." },
      400,
    );
  }

  const validation = validateNewsletterSubscribe(body);
  if (!validation.ok) {
    return json({ error: validation.error }, 400);
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    let branchId: string | null = null;
    if (validation.data.branchSlug) {
      const branch = await prisma.branch.findUnique({
        where: { slug: validation.data.branchSlug },
        select: { id: true },
      });
      branchId = branch?.id ?? null;
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: validation.data.email },
      create: {
        email: validation.data.email,
        branchId,
        status: "ACTIVE",
        unsubscribeToken: generateUnsubscribeToken(),
      },
      update: { status: "ACTIVE", unsubscribedAt: null, branchId },
    });
  } catch (error) {
    console.error("[newsletter-subscribe] gagal menyimpan subscriber:", errorCode(error));
    return json({ error: "Terjadi kesalahan pada server. Silakan coba lagi." }, 500);
  }

  return json({ ok: true });
}
