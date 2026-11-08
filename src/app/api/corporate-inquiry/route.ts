import { NextResponse } from "next/server";

import {
  describeTurnstileError,
  extractClientIp,
  isFilledTooFast,
  isHoneypotFilled,
  validateInquiry,
  type InquiryInput,
} from "@/lib/domain/inquiry";
import { corporateInquiryLimiter } from "@/lib/domain/rate-limit";
import { stripTags } from "@/lib/domain/sanitize";

/**
 * Endpoint submit form inquiry Corporate Wellness.
 *
 * Lapis pertahanan (urutan penting):
 * 1. Rate limit per IP (5 permintaan / 10 menit).
 * 2. Honeypot `website` — kalau terisi, balas 200 palsu tanpa menyimpan.
 * 3. Validasi zod.
 * 4. Cek waktu isi form minimal 3 detik.
 * 5. Cloudflare Turnstile (hanya bila `TURNSTILE_SECRET_KEY` diset).
 * 6. Simpan ke tabel `CorporateInquiry` (status NEW) + kirim email ke PIC.
 *
 * Kegagalan pengiriman email tidak menggagalkan respons — inquiry sudah
 * tersimpan dan tetap terlihat di dashboard admin.
 */

// Tanpa `runtime`/`dynamic`: `cacheComponents` menolak route segment config,
// dan handler POST memang selalu dijalankan per-request.

type TurnstileResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

async function verifyTurnstile(
  token: string,
  secret: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
      },
    );

    if (!response.ok) {
      return { ok: false, error: "Verifikasi captcha gagal. Silakan coba lagi." };
    }

    const data = (await response.json()) as TurnstileResponse;
    if (!data.success) {
      return { ok: false, error: describeTurnstileError(data["error-codes"]) };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Verifikasi captcha gagal. Silakan coba lagi.",
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendNotificationEmail(input: {
  to: string;
  inquiry: InquiryInput;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;

  const { inquiry } = input;
  const lines = [
    `Nama: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.company ? `Perusahaan: ${inquiry.company}` : null,
    inquiry.phone ? `Telepon: ${inquiry.phone}` : null,
    "",
    inquiry.message,
  ].filter((line): line is string => line !== null);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Inquiry Corporate Wellness — ${inquiry.name}`,
      text: lines.join("\n"),
      html: `<p><strong>Inquiry Corporate Wellness baru</strong></p><ul>${[
        `Nama: ${escapeHtml(inquiry.name)}`,
        `Email: ${escapeHtml(inquiry.email)}`,
        inquiry.company ? `Perusahaan: ${escapeHtml(inquiry.company)}` : null,
        inquiry.phone ? `Telepon: ${escapeHtml(inquiry.phone)}` : null,
      ]
        .filter((line): line is string => line !== null)
        .map((line) => `<li>${line}</li>`)
        .join("")}</ul><p>${escapeHtml(inquiry.message).replace(/\n/g, "<br />")}</p>`,
    }),
  });

  if (!response.ok) {
    console.error(
      "[corporate-inquiry] email notifikasi gagal:",
      response.status,
      await response.text().catch(() => ""),
    );
  }
}

export async function POST(request: Request) {
  const ip = extractClientIp(request.headers);

  const limit = corporateInquiryLimiter.check(ip);
  if (!limit.allowed) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(limit.retryAfterMs / 1000),
    );
    return NextResponse.json(
      {
        error:
          "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.",
      },
      { status: 429, headers: { "retry-after": String(retryAfterSeconds) } },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body permintaan tidak valid." },
      { status: 400 },
    );
  }

  const body = (raw ?? {}) as Record<string, unknown>;

  // Honeypot: balas 200 supaya bot thinks it's accepted, tapi jangan simpan.
  if (isHoneypotFilled(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const validation = validateInquiry(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const inquiry = validation.data;

  // Terlalu cepat diisi (< 3 detik) → perlakukan sebagai bot.
  if (isFilledTooFast(inquiry.startedAt)) {
    return NextResponse.json({ ok: true });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!inquiry.captchaToken) {
      return NextResponse.json(
        { error: "Verifikasi captcha wajib diisi." },
        { status: 400 },
      );
    }
    const captcha = await verifyTurnstile(
      inquiry.captchaToken,
      turnstileSecret,
    );
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 });
    }
  }

  const name = stripTags(inquiry.name);
  const company = inquiry.company ? stripTags(inquiry.company) : null;
  const email = stripTags(inquiry.email);
  const phone = inquiry.phone ? stripTags(inquiry.phone) : null;
  const message = stripTags(inquiry.message);

  try {
    const { prisma } = await import("@/lib/prisma");

    await prisma.corporateInquiry.create({
      data: {
        name,
        company: company || null,
        email,
        phone: phone || null,
        message,
        status: "NEW",
      },
    });

    // Email notifikasi — hanya bila kredensial Resend tersedia.
    try {
      const [corporate, settings] = await Promise.all([
        prisma.corporateContent.findUnique({ where: { id: "singleton" } }),
        prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
      ]);

      const recipient =
        corporate?.picEmail?.trim() ||
        settings?.email?.trim() ||
        process.env.CORPORATE_INQUIRY_TO?.trim() ||
        "";

      if (recipient && process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
        await sendNotificationEmail({ to: recipient, inquiry });
      }
    } catch (error) {
      // Kegagalan email tidak boleh menggagalkan respons ke pengunjung.
      console.error("[corporate-inquiry] notifikasi email gagal:", error);
    }
  } catch (error) {
    console.error("[corporate-inquiry] gagal menyimpan inquiry:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Silakan coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
