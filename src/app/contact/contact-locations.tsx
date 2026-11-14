import { LocationMap } from "@/components/contact/location-map";
import { LocationInfo } from "@/components/contact/location-info";
import { Reveal } from "@/components/reveal";
import type { Branch } from "@/lib/content/branches";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { SiteSettings } from "@/lib/content/site";
import { FLAGSHIP_LOCATION_SLUG } from "@/lib/domain/site-settings";

/** Peta semua cabang + kartu info per cabang + embed peta flagship. */
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
  return (
    <Reveal as="section" className="padding-section-global">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <h2 className="header-l">{copy(pageCopy, "contact.locations.title")}</h2>
          </div>
          <div id="contact-map">
            <LocationMap
              locations={branches}
              openMapsLabel={copy(pageCopy, "contact.location.open_maps")}
            />
          </div>
          {branches.length === 0 ? (
            copy(pageCopy, "contact.locations.empty") ? (
              <p className="mt-10 body-m text-color-gray">
                {copy(pageCopy, "contact.locations.empty")}
              </p>
            ) : null
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
              {branches.map((branch, index) => (
                <div key={branch.slug} className="contact-info-card">
                  <LocationInfo
                    loc={branch}
                    waHref={branchWaHrefs[index] ?? null}
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
              ))}
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