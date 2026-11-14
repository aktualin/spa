import type { CorporateFormLabels } from "./corporate-inquiry-labels";

/** Captcha belum dikonfigurasi → arahkan pengunjung ke WhatsApp/email. */
export function InquiryUnavailable({
  labels,
  whatsappHref,
  contactEmail,
}: {
  labels: CorporateFormLabels;
  whatsappHref: string | null;
  contactEmail: string;
}) {
  return (
    <div role="status" className="flex flex-col gap-3 border border-cocoa/20 bg-cream px-6 py-8">
      <p className="text-body text-cocoa/80">{labels.unavailable}</p>
      <div className="flex flex-wrap gap-3">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            data-wa-context="default"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            {labels.whatsapp}
          </a>
        ) : null}
        {contactEmail ? (
          <a href={`mailto:${contactEmail}`} className="btn btn-outline border-cocoa/40">
            {contactEmail}
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** Ucapan sukses setelah server menerima inquiry. */
export function InquirySuccess({ labels }: { labels: CorporateFormLabels }) {
  return (
    <div role="status" className="flex flex-col gap-2 border border-cocoa/20 bg-cream px-6 py-10">
      <h3 className="font-display text-title-sm md:text-[1.375rem]">
        {labels.successTitle}
      </h3>
      <p className="max-w-[52ch] text-body text-cocoa/70">
        {labels.successBody}
      </p>
    </div>
  );
}