import { fieldClass } from "./corporate-inquiry-helpers";
import type { CorporateFormLabels } from "./corporate-inquiry-labels";

/** Empat field identitas: nama, perusahaan, email, telepon. */
export function InquiryIdentityFields({
  labels,
  fieldErrors,
}: {
  labels: CorporateFormLabels;
  fieldErrors: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-2">
        <span className="eyebrow text-cocoa/70">{labels.name}</span>
        <input name="name" type="text" required maxLength={120} autoComplete="name" className={fieldClass} />
        {fieldErrors.name ? <span className="text-caption text-error">{fieldErrors.name}</span> : null}
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="eyebrow text-cocoa/70">{labels.company}</span>
        <input
          name="company"
          type="text"
          maxLength={160}
          autoComplete="organization"
          className={fieldClass}
        />
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="eyebrow text-cocoa/70">{labels.email}</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClass} />
        {fieldErrors.email ? <span className="text-caption text-error">{fieldErrors.email}</span> : null}
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="eyebrow text-cocoa/70">{labels.phone}</span>
        <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={fieldClass} />
      </label>
    </div>
  );
}

/** Field pesan panjang. */
export function InquiryMessageField({
  labels,
  error,
}: {
  labels: CorporateFormLabels;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-cocoa/70">{labels.message}</span>
      <textarea
        name="message"
        required
        rows={5}
        maxLength={5000}
        placeholder={labels.messagePlaceholder}
        className={fieldClass}
      />
      {error ? <span className="text-caption text-error">{error}</span> : null}
    </label>
  );
}