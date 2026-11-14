import { validateNewsletter } from "@/lib/domain/forms";
import { newsletterLimiter } from "@/lib/domain/rate-limit";
import { stripTags } from "@/lib/domain/sanitize";

import { errorCode, guardFormRequest, isBotBody, json, parseFormBody } from "../form-helpers";

/**
 * Endpoint submit formulir newsletter footer (`/api/newsletter`).
 * Pertahanan mengikuti pola inquiry corporate: origin, rate limit per IP
 * (hash, tanpa menyimpan IP), batas body, honeypot + lama pengisian
 * (`isBotSubmission` → sukses palsu), validasi zod, lalu simpan.
 * Tanpa Turnstile dan tanpa email; data pribadi tidak pernah ditulis ke log.
 */

// Tanpa `runtime`/`dynamic`: `cacheComponents` menolak route segment config.

/** Batas ukuran body — payload newsletter jauh lebih kecil dari inquiry. */
const MAX_BODY = 10_000;

export async function POST(request: Request) {
  const guarded = guardFormRequest(request, newsletterLimiter, "newsletter");
  if (guarded) return guarded;

  const parsed = await parseFormBody(request, MAX_BODY);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  if (isBotBody(body)) return json({ ok: true });

  const validation = validateNewsletter(body);
  if (!validation.ok) return json({ error: validation.error }, 400);

  const data = {
    email: stripTags(validation.data.email).trim(),
    name: validation.data.name ? stripTags(validation.data.name).trim() || null : null,
    branchSlug: validation.data.branchSlug?.trim() || null,
  };

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.newsletterSignup.create({ data });
  } catch (error) {
    console.error("[newsletter] gagal menyimpan pendaftar:", errorCode(error));
    return json({ error: "Terjadi kesalahan pada server. Silakan coba lagi." }, 500);
  }

  return json({ ok: true });
}