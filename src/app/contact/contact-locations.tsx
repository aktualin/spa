import { LocationMap } from "@/components/contact/location-map";
import { LocationInfo } from "@/components/contact/location-info";
import { Reveal } from "@/components/reveal";
import type { Branch } from "@/lib/content/branches";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { SiteSettings } from "@/lib/content/site";
import { FLAGSHIP_LOCATION_SLUG } from "@/lib/domain/site-settings";

/**
 * Satu lokasi: kartu info cabang pertama berdampingan dengan petanya
 * (kartu kiri, peta kanan; menumpuk di layar kecil). Halaman meneruskan
 * hanya cabang pertama; embed Google opsional tetap di bawah bila diisi.
 */
export function ContactLocations({
  branches,
  branchWaHrefs,
  settings,
  pageCopy,
}: {
  branches: Branch[];
  branchWaHrefs: (string | null)[];
  settings: SiteSettings;
  pageCopy: PageCopy;
}) {
  const branch = branches[0];
  return (
    <Reveal as="section" className="padding-section-global">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <h2 className="header-l">{copy(pageCopy, "contact.locations.title")}</h2>
          </div>
          {!branch ? (
            copy(pageCopy, "contact.locations.empty") ? (
              <p className="mt-10 body-m text-color-gray">
                {copy(pageCopy, "contact.locations.empty")}
              </p>
            ) : null
          ) : (
            <div
              id="contact-map"
              className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[2fr_3fr]"
            >
              <div className="contact-info-card flex flex-col justify-center rounded-sm bg-white p-6 lg:p-8">
                <LocationInfo
                  loc={branch}
                  waHref={branchWaHrefs[0] ?? null}
                  freshaUrl={
                    branch.slug === FLAGSHIP_LOCATION_SLUG ? settings.freshaUrl : undefined
                  }
                  labels={{
                    addressMissing: copy(pageCopy, "contact.location.address_missing"),
                    whatsappFallback: copy(
                      pageCopy,
                      "contact.location.whatsapp_fallback",
                    ),
                    whatsappCta: copy(pageCopy, "contact.location.whatsapp_cta"),
                    directions: copy(pageCopy, "contact.location.directions"),
                    fresha: copy(pageCopy, "contact.location.fresha"),
                  }}
                />
              </div>
              <div className="min-w-0">
                <LocationMap
                  locations={[branch]}
                  openMapsLabel={copy(pageCopy, "contact.location.open_maps")}
                />
              </div>
            </div>
          )}
          {settings.mapsEmbedUrl ? (
            <iframe
              src={settings.mapsEmbedUrl}
              title={copy(pageCopy, "contact.maps_title") || "KAMA Spa — Google Maps"}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="mt-10 h-[400px] w-full rounded-sm border-0"
            />
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
