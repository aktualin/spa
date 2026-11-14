import { ExternalLink, WhatsApp } from "@/components/icons";

/** Deretan tombol aksi kartu cabang: WhatsApp, rute maps, dan Fresha. */
export function LocationInfoActions({
  waHref,
  mapsUrl,
  freshaUrl,
  labels,
}: {
  waHref: string | null;
  mapsUrl: string;
  freshaUrl?: string;
  labels: {
    whatsappCta: string;
    directions: string;
    fresha: string;
  };
}) {
  return (
    <div className="mt-auto flex flex-wrap gap-2 pt-3">
      {waHref ? (
        <a
          className="btn btn-primary"
          href={waHref}
          data-wa-context="location"
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsApp className="h-4 w-4" aria-hidden="true" />
          {labels.whatsappCta}
        </a>
      ) : null}
      {mapsUrl ? (
        <a
          className="btn btn-outline border-cocoa/40 text-cocoa"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {labels.directions}
        </a>
      ) : null}
      {freshaUrl ? (
        <a
          className="btn btn-outline border-cocoa/40 text-cocoa"
          href={freshaUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {labels.fresha}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}