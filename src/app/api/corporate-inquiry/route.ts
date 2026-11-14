import { after } from "next/server";

import { verifyCaptcha } from "@/lib/captcha";
import { MAX_INQUIRY_BODY, checkFillTime } from "@/lib/domain/corporate";
import { isHoneypotFilled, validateInquiry } from "@/lib/domain/inquiry";
import { corporateInquiryLimiter } from "@/lib/domain/rate-limit";
import { notifyCorporateInquiry } from "@/lib/email";

import { errorCode, guardFormRequest, json, parseFormBody } from "../form-helpers";
import { toInquiryRecord } from "./inquiry-record";

/**
 * Endpoint submit formulir inquiry Corporate Wellness (`/corporate#inquiry`).
 *
 * Lapis pertahanan (urutan penting):
 * 1. Origin harus situs ini bila header Origin ada (tolak kiriman lintas situs).
 * 2. Rate limit per IP (5 permintaan / 10 menit). IP hanya dipakai sebagai
 *    kunci hash di memori — tidak pernah disimpan ke database atau log.
 * 3. Batas ukuran body.
 * 4. Honeypot `website` — terisi → balas sukses palsu tanpa menyimpan.
 * 5. Lama pengisian (`elapsedMs`, dihitung browser): tidak ada → bot (sukses
 *    palsu); < 3 detik → ditolak dengan pesan agar manusia bisa mengirim ulang.
 * 6. Validasi zod + persetujuan pemrosesan data (UU PDP).
 * 7. Cloudflare Turnstile. Secret kosong di production → fail-closed (503).
 * 8. Simpan ke `CorporateInquiry` (status NEW), lalu — setelah respons
 *    terkirim — email ke pihak pertama dan catat `emailSentAt`/`emailError`.
 *
 * Data pribadi pengirim tidak pernah ditulis ke log.
 */

// Tanpa `runtime`/`dynamic`: `cacheComponents` menolak route segment config,
// dan handler POST memang selalu dijalankan per-request.

export async function POST(request: Request) {
  const guarded = guardFormRequest(request, corporateInquiryLimiter, "corporate-inquiry");
  if (guarded) return guarded;

  const parsed = await parseFormBody(request, MAX_INQUIRY_BODY);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  // Honeypot: balas sukses supaya bot mengira terkirim, tapi jangan simpan.
  if (isHoneypotFilled(body.website)) {
    return json({ ok: true });
  }

  const fill = checkFillTime(body.elapsedMs);
  if (fill === "missing") return json({ ok: true });
  if (fill === "too-fast") {
    return json({ error: "Formulir terkirim terlalu cepat. Mohon periksa isian Anda lalu kirim ulang." }, 400);
  }

  const validation = validateInquiry({
    name: body.name,
    company: body.company,
    email: body.email,
    phone: body.phone,
    message: body.message,
    captchaToken: body.captchaToken,
  });
  if (!validation.ok) {
    return json({ error: validation.error }, 400);
  }
  if (body.consent !== true) {
    return json(
      { error: "Mohon setujui pemrosesan data untuk menindaklanjuti inquiry ini." },
      400,
    );
  }

  const captcha = await verifyCaptcha(validation.data.captchaToken);
  if (!captcha.ok) {
    return json({ error: captcha.error }, captcha.status);
  }

  const inquiry = toInquiryRecord(validation.data);
  if (!inquiry.name || !inquiry.message) {
    return json({ error: "Mohon lengkapi nama dan pesan." }, 400);
  }

  let id: string;
  try {
    const { prisma } = await import("@/lib/prisma");
    const created = await prisma.corporateInquiry.create({
      data: { ...inquiry, status: "NEW" },
      select: { id: true },
    });
    id = created.id;
  } catch (error) {
    console.error("[corporate-inquiry] gagal menyimpan inquiry:", errorCode(error));
    return json({ error: "Terjadi kesalahan pada server. Silakan coba lagi." }, 500);
  }

  // Email ke pihak pertama dikirim setelah respons — kegagalannya tidak
  // pernah menggagalkan penyimpanan; hasilnya dicatat di baris inquiry
  // (`emailSentAt` / `emailError`) dan terlihat di dashboard.
  after(() => notifyCorporateInquiry(id));

  return json({ ok: true });
}