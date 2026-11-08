/**
 * Pengiriman email transaksional lewat Resend REST API (tanpa SDK).
 *
 * Env:
 * - `RESEND_API_KEY` — API key Resend.
 * - `EMAIL_FROM`     — pengirim terverifikasi, mis. "KAMA Spa <noreply@kamaspa.id>".
 *
 * Fungsi ini tidak pernah melempar error dan tidak pernah menulis isi email
 * ke log: hasilnya `{ ok: false, error }` dengan pesan ringkas TANPA data
 * pribadi, aman disimpan ke database (mis. `CorporateInquiry.emailError`).
 */

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

/* ------------------------------------------------------------------ */
/* Notifikasi inquiry Corporate Wellness                               */
/* ------------------------------------------------------------------ */

/**
 * Kirim satu inquiry Corporate Wellness ke pihak pertama (KAMA Spa) lalu catat
 * hasilnya di baris inquiry: `emailSentAt` bila terkirim, `emailError` (pesan
 * ringkas tanpa data pribadi) bila gagal. Tidak pernah melempar error.
 *
 * Penerima: `CORPORATE_INQUIRY_TO` (boleh beberapa, dipisah koma) → email PIC
 * di konten Corporate → email PIC bawaan halaman (`marketing@kamaspa.id`).
 *
 * Hanya dipanggil dari route inquiry publik (setelah inquiry tersimpan) dan
 * dari Server Action admin yang sudah memeriksa role.
 */
export async function notifyCorporateInquiry(id: string): Promise<SendEmailResult> {
  const [{ prisma }, domain, { getSiteUrl }] = await Promise.all([
    import("@/lib/prisma"),
    import("@/lib/domain/corporate"),
    import("@/lib/site-url"),
  ]);

  let result: SendEmailResult;
  try {
    const [inquiry, content] = await Promise.all([
      prisma.corporateInquiry.findUnique({
        where: { id },
        select: { name: true, company: true, email: true, phone: true, message: true },
      }),
      prisma.corporateContent
        .findUnique({ where: { id: "singleton" }, select: { picEmail: true } })
        .catch(() => null),
    ]);
    if (!inquiry) return { ok: false, error: "Inquiry tidak ditemukan." };

    const to = domain.resolveInquiryRecipients({
      envTo: process.env.CORPORATE_INQUIRY_TO,
      picEmail: content?.picEmail?.trim() || domain.STATIC_PIC.email,
    });
    const message = domain.buildInquiryEmail({
      ...inquiry,
      adminUrl: `${getSiteUrl()}/admin/corporate/inquiries/${id}`,
    });
    result = await sendEmail({ to, ...message, replyTo: inquiry.email });
  } catch (error) {
    result = { ok: false, error: `Gagal menyiapkan email (${errorName(error)}).` };
  }

  try {
    await prisma.corporateInquiry.update({
      where: { id },
      data: result.ok
        ? { emailSentAt: new Date(), emailError: null }
        : { emailError: result.error.slice(0, 300) },
    });
  } catch (error) {
    console.error("[corporate-inquiry] gagal mencatat status email:", errorName(error));
  }
  if (!result.ok) {
    // Pesan ringkas tanpa data pribadi.
    console.error("[corporate-inquiry] email notifikasi gagal:", result.error);
  }
  return result;
}

function errorName(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code);
  }
  return error instanceof Error ? error.name : "unknown";
}
