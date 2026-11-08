/**
 * Verifikasi Cloudflare Turnstile di server.
 *
 * Env:
 * - `TURNSTILE_SECRET_KEY`           — secret key (server).
 * - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — site key (widget di browser).
 *
 * Kebijakan (lihat `resolveCaptchaPolicy`): secret kosong di production →
 * fail-closed (kiriman ditolak); di development dilewati dengan peringatan.
 */
import { describeTurnstileError } from "@/lib/domain/inquiry";
import { resolveCaptchaPolicy } from "@/lib/domain/corporate";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 8_000;

export type CaptchaResult =
  | { ok: true; skipped: boolean }
  | { ok: false; status: 400 | 503; error: string };

type SiteverifyResponse = { success?: boolean; "error-codes"?: unknown };

/** true bila widget + verifikasi captcha siap dipakai (kedua key terisi). */
export function isCaptchaConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );
}

export async function verifyCaptcha(token: string | undefined | null): Promise<CaptchaResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const policy = resolveCaptchaPolicy({ secret, nodeEnv: process.env.NODE_ENV });

  if (policy === "unavailable") {
    console.error("[captcha] TURNSTILE_SECRET_KEY belum diatur — kiriman formulir ditolak.");
    return {
      ok: false,
      status: 503,
      error:
        "Formulir sementara tidak dapat menerima kiriman. Silakan hubungi kami lewat WhatsApp atau email.",
    };
  }
  if (policy === "skip") {
    console.warn("[captcha] TURNSTILE_SECRET_KEY kosong — verifikasi dilewati (development).");
    return { ok: true, skipped: true };
  }

  if (!token || !token.trim()) {
    return { ok: false, status: 400, error: "Mohon selesaikan verifikasi captcha terlebih dahulu." };
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // IP pengunjung sengaja tidak dikirim (minimalisasi data pribadi).
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      return { ok: false, status: 400, error: "Verifikasi captcha gagal. Silakan coba lagi." };
    }
    const data = (await response.json().catch(() => null)) as SiteverifyResponse | null;
    if (!data?.success) {
      return { ok: false, status: 400, error: describeCaptchaError(data?.["error-codes"]) };
    }
    return { ok: true, skipped: false };
  } catch {
    return { ok: false, status: 400, error: "Verifikasi captcha gagal. Silakan coba lagi." };
  }
}

/** Turnstile mengirim `error-codes` sebagai array string. */
function describeCaptchaError(codes: unknown): string {
  if (Array.isArray(codes) && codes.includes("timeout-or-duplicate")) {
    return "Verifikasi captcha kedaluwarsa. Silakan selesaikan captcha lagi.";
  }
  return describeTurnstileError(
    Array.isArray(codes) ? codes.map((code) => ({ code: String(code) })) : codes,
  );
}
