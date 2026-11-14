/** Pengiriman email transaksional lewat Resend REST API (tanpa SDK). */

export type SendEmailInput = {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string | null;
};

export type SendEmailResult = { ok: true; id: string | null } | { ok: false; error: string };

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 10_000;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    return { ok: false, error: "RESEND_API_KEY atau EMAIL_FROM belum diatur." };
  }
  if (input.to.length === 0) {
    return { ok: false, error: "Alamat penerima belum diatur." };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      // Isi respons Resend tidak disimpan/dicatat: bisa memuat alamat email.
      return { ok: false, error: `Resend menolak permintaan (HTTP ${response.status}).` };
    }

    const data = (await response.json().catch(() => null)) as { id?: unknown } | null;
    return { ok: true, id: typeof data?.id === "string" ? data.id : null };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return {
      ok: false,
      error: timedOut
        ? "Resend tidak merespons (timeout)."
        : "Gagal menghubungi Resend (jaringan).",
    };
  }
}