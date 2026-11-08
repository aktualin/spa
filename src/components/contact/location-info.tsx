import { Fragment } from "react";
import type { Branch } from "@/lib/content/branches";
import { LocationPin, Clock, WhatsApp, ExternalLink } from "@/components/icons";
import {
  locationMessage,
  RESERVE_MESSAGE,
  waLink,
} from "@/lib/whatsapp";

/**
 * Kartu info cabang. Data cabang berasal dari modul Cabang; nomor WhatsApp
 * dan jam operasional kartu sudah diisi nilai Kontak & Umum oleh reader bila
 * kolom cabangnya dikosongkan. `freshaUrl` berasal dari Kontak & Umum dan
 * hanya ditampilkan untuk cabang utama.
 */
export function LocationInfo({
  loc,
  freshaUrl,
}: {
  loc: Branch;
  freshaUrl?: string;
}) {
  const waHref = waLink(
    loc.address ? locationMessage(loc.address) : RESERVE_MESSAGE,
    // Nomor cabang kosong → link jatuh ke pengaturan situs di atas.
    loc.whatsappNumber || undefined,
  );
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
            : "Alamat belum diisi; hubungi kami untuk lokasi terdekat."}
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
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {loc.phone || "WhatsApp"}
        </a>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        <a
          className="btn btn-primary"
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsApp className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
        {loc.mapsUrl ? (
          <a
            className="btn btn-outline border-cocoa/40 text-cocoa"
            href={loc.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dapatkan Rute
          </a>
        ) : null}
        {freshaUrl ? (
          <a
            className="btn btn-outline border-cocoa/40 text-cocoa"
            href={freshaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Booking via Fresha
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
