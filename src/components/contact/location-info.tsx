import { Fragment } from "react";
import type { Branch } from "@/lib/content/branches";
import { LocationPin, Clock, WhatsApp } from "@/components/icons";
import { LocationInfoActions } from "./location-info-actions";

/**
 * Kartu info cabang. Data cabang berasal dari modul Cabang; nomor WhatsApp
 * dan jam operasional kartu sudah diisi nilai Kontak & Umum oleh reader bila
 * kolom cabangnya dikosongkan. `freshaUrl` berasal dari Kontak & Umum dan
 * hanya ditampilkan untuk cabang utama. `waHref` dibangun di server lewat
 * `branchWhatsAppHref` (template "location"); null → tombol WA disembunyikan.
 */
export function LocationInfo({
  loc,
  waHref,
  freshaUrl,
  labels,
}: {
  loc: Branch;
  waHref: string | null;
  freshaUrl?: string;
  labels: {
    addressMissing: string;
    whatsappFallback: string;
    whatsappCta: string;
    directions: string;
    fresha: string;
  };
}) {
  const hourLines = loc.openingHours;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-title-sm">
        {loc.name} | {loc.area}
      </h3>
      <div className="flex items-center gap-2 text-body text-cocoa/70">
        <LocationPin className="h-4 w-4 shrink-0" />
        <span>
          {loc.address
            ? loc.address
            : labels.addressMissing}
        </span>
      </div>
      {hourLines.length > 0 ? (
        <div
          className={`flex ${hourLines.length > 1 ? "items-start" : "items-center"} gap-2 text-body text-cocoa/70`}
        >
          <Clock className={`h-4 w-4 shrink-0${hourLines.length > 1 ? " mt-1" : ""}`} />
          <span>
            {hourLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </span>
        </div>
      ) : null}
      <div className="flex items-center gap-2 text-body text-cocoa/70">
        <WhatsApp className="h-4 w-4 shrink-0" />
        {waHref ? (
          <a
            href={waHref}
            data-wa-context="location"
            target="_blank"
            rel="noopener noreferrer"
          >
            {loc.phone || labels.whatsappFallback}
          </a>
        ) : (
          <span>{loc.phone || labels.whatsappFallback}</span>
        )}
      </div>
      <LocationInfoActions
        waHref={waHref}
        mapsUrl={loc.mapsUrl}
        freshaUrl={freshaUrl}
        labels={labels}
      />
    </div>
  );
}