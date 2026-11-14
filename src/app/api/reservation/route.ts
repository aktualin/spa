import { validateReservation } from "@/lib/domain/forms";
import { reservationLimiter } from "@/lib/domain/rate-limit";
import { stripTags } from "@/lib/domain/sanitize";

import { errorCode, guardFormRequest, isBotBody, json, parseFormBody } from "../form-helpers";

/**
 * Endpoint submit formulir reservasi halaman kontak (`/api/reservation`).
 * Pertahanan mengikuti pola inquiry corporate: origin, rate limit per IP
 * (hash, tanpa menyimpan IP), batas body, honeypot + lama pengisian
 * (`isBotSubmission` → sukses palsu), validasi zod, lalu simpan (status NEW).
 * Tanpa Turnstile dan tanpa email; data pribadi tidak pernah ditulis ke log.
 */

// Tanpa `runtime`/`dynamic`: `cacheComponents` menolak route segment config.

/** Batas ukuran body — pesan reservasi maks. 1000 karakter + field lain. */
const MAX_BODY = 20_000;

export async function POST(request: Request) {
  const guarded = guardFormRequest(request, reservationLimiter, "reservation");
  if (guarded) return guarded;

  const parsed = await parseFormBody(request, MAX_BODY);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  if (isBotBody(body)) return json({ ok: true });

  const validation = validateReservation(body);
  if (!validation.ok) return json({ error: validation.error }, 400);

  const data = {
    name: stripTags(validation.data.name).trim(),
    phone: stripTags(validation.data.phone).trim(),
    email: validation.data.email ? stripTags(validation.data.email).trim() || null : null,
    branchSlug: validation.data.branchSlug?.trim() || null,
    message: validation.data.message ? stripTags(validation.data.message).trim() || null : null,
    status: "NEW" as const,
  };
  if (!data.name || !data.phone) {
    return json({ error: "Mohon lengkapi nama dan nomor telepon." }, 400);
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.reservationRequest.create({ data });
  } catch (error) {
    console.error("[reservation] gagal menyimpan permintaan:", errorCode(error));
    return json({ error: "Terjadi kesalahan pada server. Silakan coba lagi." }, 500);
  }

  return json({ ok: true });
}