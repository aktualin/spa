import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LocationMap } from "@/components/contact/location-map";
import { LocationInfo } from "@/components/contact/location-info";
import { Reveal } from "@/components/reveal";
import { getBranches } from "@/lib/content/branches";
import { withPageSeo } from "@/lib/content/seo";
import { getSiteSettings } from "@/lib/content/site";
import { FLAGSHIP_LOCATION_SLUG } from "@/lib/domain/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/contact", {
    title: "Contact",
    description:
      "Hubungi KAMA Spa untuk reservasi treatment di South Jakarta. Booking via WhatsApp atau formulir reservasi.",
  });
}

export default async function ContactPage() {
  // Cabang dikelola di modul Cabang; alamat, jam, nomor, peta, dan koordinat
  // per cabang. Nomor/jam yang dikosongkan per cabang mengikuti Kontak & Umum.
  const [branches, settings] = await Promise.all([getBranches(), getSiteSettings()]);
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
                <LocationMap locations={branches} />
              </div>
              {branches.length === 0 ? (
                <p className="mt-10 body-m text-color-gray">
                  Lokasi kami akan diumumkan segera. Sementara itu, hubungi kami
                  via WhatsApp untuk reservasi di semua area kami.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
                  {branches.map((branch) => (
                    <div key={branch.slug} className="contact-info-card">
                      <LocationInfo
                        loc={branch}
                        freshaUrl={
                          branch.slug === FLAGSHIP_LOCATION_SLUG ? settings.freshaUrl : undefined
                        }
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
