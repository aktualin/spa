import type { WhatsAppHrefOptions } from "@/lib/content/whatsapp";
import type { WhatsAppContextKey } from "@/lib/domain/whatsapp-template";

import { WaButton } from "./wa-button";

/** CTA WhatsApp kartu katalog (treatment & package): spacer + tombol lama. */
export function CatalogWaCta({
  context,
  custom,
  values,
  label,
}: WhatsAppHrefOptions & {
  context: WhatsAppContextKey;
  label: string;
}) {
  return (
    <>
      <div className="spacer-small" />
      <WaButton
        context={context}
        custom={custom}
        values={values}
        label={label}
        className="button is-secondary is-icon w-inline-block"
      />
    </>
  );
}