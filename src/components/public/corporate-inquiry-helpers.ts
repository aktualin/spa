import type { CorporateFormLabels } from "./corporate-inquiry-labels";

export type FormState = "idle" | "loading" | "success" | "error";

export const fieldClass =
  "border border-cocoa/30 bg-cream px-4 py-3 text-body text-cocoa outline-none transition-colors focus:border-cocoa";

export type InquiryValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  website: string;
  consent: boolean;
};

/** Baca & trim isian formulir; honeypot `website` ikut dibaca apa adanya. */
export function readInquiryValues(formData: FormData): InquiryValues {
  const value = (name: string) => String(formData.get(name) ?? "").trim();
  return {
    name: value("name"),
    company: value("company"),
    email: value("email"),
    phone: value("phone"),
    message: value("message"),
    website: value("website"),
    consent: formData.get("consent") === "on",
  };
}

/** Validasi sisi klien; server tetap memeriksa ulang semua aturan ini. */
export function inquiryFieldErrors(
  values: InquiryValues,
  captcha: { required: boolean; token: string | null },
  labels: CorporateFormLabels,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = labels.errorName;
  if (!values.email) {
    errors.email = labels.errorEmailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = labels.errorEmailFormat;
  }
  if (values.message.length < 10) errors.message = labels.errorMessage;
  if (!values.consent) errors.consent = labels.errorConsent;
  if (captcha.required && !captcha.token) {
    errors.captcha = labels.errorCaptcha;
  }
  return errors;
}

/** POST inquiry; error server (bila ada) diteruskan untuk ditampilkan. */
export async function postInquiry(
  values: InquiryValues,
  captchaToken: string | null,
  elapsedMs: number | undefined,
): Promise<{ ok: boolean; serverError: string }> {
  const response = await fetch("/api/corporate-inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: values.name,
      company: values.company || undefined,
      email: values.email,
      phone: values.phone || undefined,
      message: values.message,
      consent: values.consent,
      captchaToken: captchaToken ?? undefined,
      website: values.website,
      elapsedMs,
    }),
  });

  const payload: unknown = await response.json().catch(() => null);
  const serverError =
    payload && typeof payload === "object" && "error" in payload
      ? String((payload as { error?: unknown }).error ?? "")
      : "";

  return { ok: response.ok, serverError };
}