import Link from "next/link";

import type { CorporateFormLabels } from "./corporate-inquiry-labels";

/** Checkbox persetujuan privacy beserta pesan errornya. */
export function InquiryConsent({
  labels,
  privacyHref,
  error,
}: {
  labels: CorporateFormLabels;
  privacyHref: string;
  error?: string;
}) {
  return (
    <>
      <label className="flex items-start gap-3 text-body text-cocoa/80">
        <input name="consent" type="checkbox" required className="mt-1 size-4 shrink-0" />
        <span>
          {labels.consentPrefix}{" "}
          <Link href={privacyHref} className="underline">
            {labels.privacyLabel}
          </Link>
          {labels.consentSuffix}
        </span>
      </label>
      {error ? (
        <span className="-mt-3 text-caption text-error">{error}</span>
      ) : null}
    </>
  );
}