"use client";

import { InquiryConsent } from "./corporate-inquiry-consent";
import { InquiryIdentityFields, InquiryMessageField } from "./corporate-inquiry-fields";
import type { CorporateFormLabels } from "./corporate-inquiry-labels";
import { InquirySuccess, InquiryUnavailable } from "./corporate-inquiry-status";
import { useCorporateInquiry } from "./use-corporate-inquiry";

export type { CorporateFormLabels } from "./corporate-inquiry-labels";

/**
 * Formulir inquiry Corporate Wellness (`/corporate#inquiry`).
 *
 * Mengirim `POST /api/corporate-inquiry`:
 * `{ name, company?, email, phone?, message, consent, captchaToken?, website, elapsedMs }`.
 *
 * Anti-spam (diperiksa ulang di server):
 * - `website` = honeypot, tidak terlihat manusia — harus kosong;
 * - `elapsedMs` = lama formulir terbuka (jam browser sendiri) — minimal 3 detik;
 * - Cloudflare Turnstile bila `captchaSiteKey` tersedia.
 *
 * Bila captcha belum dikonfigurasi di production (`available = false`),
 * formulir tidak ditampilkan dan pengunjung diarahkan ke WhatsApp/email.
 */
export function CorporateInquiryForm({
  captchaSiteKey,
  available,
  whatsappHref,
  privacyHref,
  contactEmail,
  labels,
}: {
  captchaSiteKey: string | null;
  available: boolean;
  /** null = nomor WA belum diatur → tombol WhatsApp disembunyikan. */
  whatsappHref: string | null;
  /** Tujuan tautan privacy pada persetujuan (CB corporate.privacy_href). */
  privacyHref: string;
  contactEmail: string;
  labels: CorporateFormLabels;
}) {
  const { state, error, fieldErrors, hydrated, formRef, widgetContainerRef, handleSubmit } =
    useCorporateInquiry({ captchaSiteKey, available, labels });

  if (!available) {
    return <InquiryUnavailable labels={labels} whatsappHref={whatsappHref} contactEmail={contactEmail} />;
  }

  if (state === "success") {
    return <InquirySuccess labels={labels} />;
  }

  return (
    <form
      ref={formRef}
      method="post"
      onSubmit={handleSubmit}
      noValidate
      className="relative flex flex-col gap-5"
    >
      <InquiryIdentityFields labels={labels} fieldErrors={fieldErrors} />
      <InquiryMessageField labels={labels} error={fieldErrors.message} />

      {/* Honeypot — tidak terlihat dan tidak bisa difokus oleh manusia. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <InquiryConsent labels={labels} privacyHref={privacyHref} error={fieldErrors.consent} />

      {captchaSiteKey ? (
        <div className="flex flex-col gap-2">
          <div ref={widgetContainerRef} />
          {fieldErrors.captcha ? (
            <span className="text-caption text-error">{fieldErrors.captcha}</span>
          ) : null}
        </div>
      ) : null}

      {state === "error" && error ? (
        <p role="alert" className="text-body text-error">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!hydrated || state === "loading"}
        >
          {state === "loading" ? labels.submitting : labels.submit}
        </button>
      </div>
    </form>
  );
}