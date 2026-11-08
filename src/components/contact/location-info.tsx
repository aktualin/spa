import { Fragment } from "react";
import type { Location } from "@/data/content";
import { LocationPin, Clock, WhatsApp, ExternalLink } from "@/components/icons";
import { locationMessage, waLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";

/**
 * Kartu info cabang. `waNumber` dan `freshaUrl` berasal dari Kontak & Umum;
 * `loc.hours` boleh berisi beberapa baris (dipisah `\n`).
 */
export function LocationInfo({
  loc,
  waNumber = WHATSAPP_NUMBER,
  freshaUrl,
}: {
  loc: Location;
  waNumber?: string;
  freshaUrl?: string;
}) {
  const waHref = waLink(locationMessage(loc.address), waNumber);
  const hourLines = loc.hours.split("\n");
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-title-sm">
        {loc.name} | {loc.area}
      </h3>
      <div className="flex items-center gap-2 text-body text-cocoa/70">
        <LocationPin className="h-4 w-4 shrink-0" />
        <span>{loc.address}</span>
      </div>
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
      <div className="flex items-center gap-2 text-body text-cocoa/70">
        <WhatsApp className="h-4 w-4 shrink-0" />
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {loc.phone}
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
        <a
          className="btn btn-outline border-cocoa/40 text-cocoa"
          href={loc.mapDirections}
          target="_blank"
          rel="noopener noreferrer"
        >
          Dapatkan Rute
        </a>
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
