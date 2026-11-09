import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LocationMap } from "@/components/contact/location-map";
import { LocationInfo } from "@/components/contact/location-info";
import { Reveal } from "@/components/reveal";
import { getBranches } from "@/lib/content/branches";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { withPageSeo } from "@/lib/content/seo";
import { getSiteSettings } from "@/lib/content/site";
import { FLAGSHIP_LOCATION_SLUG } from "@/lib/domain/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/contact", {});
}

export default async function ContactPage() {
  // Cabang dikelola di modul Cabang; alamat, jam, nomor, peta, dan koordinat
  // per cabang. Nomor/jam yang dikosongkan per cabang mengikuti Kontak & Umum.
  const [branches, settings, pageCopy] = await Promise.all([
    getBranches(),
    getSiteSettings(),
    getPageCopy(),
  ]);
  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h1 className="header-xxl">{copy(pageCopy, "contact.hero.title")}</h1>
                {copy(pageCopy, "contact.hero.description") ? (
                  <p className="body-m text-color-gray">
                    {copy(pageCopy, "contact.hero.description")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>

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
                  {branches.map((branch) => (
                    <div key={branch.slug} className="contact-info-card">
                      <LocationInfo
                        loc={branch}
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
                  title="KAMA Spa — Google Maps"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="mt-10 h-[400px] w-full rounded-sm border-0"
                />
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="section_get-in-touch is-top-off">
          <div className="get-in-touch_container">
            <div className="get-in-touch_banner">
              <h4 className="header-l">{copy(pageCopy, "contact.cta.title")}</h4>
              <Link
                href="/menu"
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>{copy(pageCopy, "contact.cta.label")}</div>
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
