import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LocationMap } from "@/components/contact/location-map";
import { LocationInfo } from "@/components/contact/location-info";
import { locations as staticLocations } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { withPageSeo } from "@/lib/content/seo";
import { getSiteSettings } from "@/lib/content/site";
import {
  FLAGSHIP_LOCATION_SLUG,
  applySiteSettingsToLocations,
} from "@/lib/domain/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/contact", {
    title: "Contact",
    description:
      "Hubungi KAMA Spa untuk reservasi treatment di South Jakarta. Booking via WhatsApp atau formulir reservasi.",
  });
}

export default async function ContactPage() {
  // Alamat, jam, nomor WhatsApp, peta & Fresha diatur di Kontak & Umum;
  // tanpa perubahan admin hasilnya identik dengan data statis.
  const settings = await getSiteSettings();
  const locations = applySiteSettingsToLocations(staticLocations, settings);
  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h1 className="header-xxl">Contact</h1>
                <p className="body-m text-color-gray">
                  Reserve your treatment, or just drop us a line — we&apos;ll help you find
                  the right ritual for what you need today.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h2 className="header-l">Our Locations</h2>
              </div>
              <div id="contact-map">
                <LocationMap locations={locations} />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
                {locations.map((loc) => (
                  <div key={loc.slug} className="contact-info-card">
                    <LocationInfo
                      loc={loc}
                      waNumber={settings.whatsappNumber}
                      freshaUrl={
                        loc.slug === FLAGSHIP_LOCATION_SLUG ? settings.freshaUrl : undefined
                      }
                    />
                  </div>
                ))}
              </div>
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
              <h4 className="header-l">Want to experience KAMA first?</h4>
              <Link
                href="/menu"
                className="button is-tertiary is-icon margin-left-auto-desktop w-inline-block"
              >
                <div>View The Menu</div>
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
