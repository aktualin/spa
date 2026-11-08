import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import {
  additionalServices,
  priceDisclaimer,
} from "@/data/content";
import {
  MenuPackagesGrid,
  MenuPackagesGridFallback,
  MenuTreatmentsGrid,
  MenuTreatmentsGridFallback,
} from "@/components/public/menu-data";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Menu Treatments",
  description:
    "KAMA Spa menu — massage, body scrub, face ritual, head & scalp treatment, bath ritual, dan paket All Day Spa.",
};

const categoryLabels: Record<string, string> = {
  Massage: "Massage",
  Body: "Body",
  Face: "Facials",
  "Head & Scalp": "Head & Scalp",
  Bath: "Bath",
};

const featureSections = [
  {
    anchor: "face",
    eyebrow: "Perawatan Wajah",
    imageFirst: true,
  },
  {
    anchor: "head",
    eyebrow: "Perawatan Kepala & Kulit Kepala",
    imageFirst: false,
  },
  {
    anchor: "bath",
    eyebrow: "Ritual Bak Mandi",
    imageFirst: true,
  },
] as const;

const menuBookPages = Array.from(
  { length: 10 },
  (_, i) => ({
    n: i + 1,
    src: `/img/kama/menu/menu-page-${String(i + 1).padStart(2, "0")}.jpg`,
  }),
);

export default function MenuPage() {
  const bodyAddOns = additionalServices.filter((s) => s.category === "Body");

  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">Menu</div>
                <h1 className="header-xxl">Each of our massage style is a nurturing journey of healing.</h1>
                <div className="spacer-medium" />
                <p className="body-m text-color-gray">
                  The journey through our signature touch is where tension fades and inner
                  peace is lovingly restored.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Treatments */}
        <Reveal as="section" id="massage" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">Massage</div>
                <h2 className="header-l">Signature Treatments</h2>
              </div>

              <Suspense fallback={<MenuTreatmentsGridFallback />}>
                <MenuTreatmentsGrid />
              </Suspense>
              <div className="spacer-large" />
              <div className="eyebrow-s text-color-gray">{priceDisclaimer}</div>
            </div>
          </div>
        </Reveal>

        {/* Body & scrub add-ons */}
        <Reveal as="section" id="body" className="padding-section-global">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">Layanan Tambahan</div>
                <h2 className="header-l">Body & Scrub</h2>
              </div>

              <div className="w-layout-grid whats-new_list">
                {bodyAddOns.map((s) => (
                  <div key={s.name} className="treatment-card w-dyn-item">
                    <div className="treatment-card_image image-container">
                      <img src={s.image} alt={s.name} loading="lazy" className="image-cover" />
                    </div>
                    <div className="treatment-card_body">
                      <div className="eyebrow-s text-style-allcaps">{categoryLabels[s.category]}</div>
                      <h3 className="header-s">{s.name}</h3>
                      <div className="body-m text-color-gray">{s.description}</div>
                      <div className="treatment-card_price-row">
                        <span className="caption-s text-color-gray">Add-on</span>
                        <span className="price-row_value">{s.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Single-service features */}
        {featureSections.map((section) => {
          const service = additionalServices.find((s) => s.anchor === section.anchor);

          if (!service) return null;

          const media = (
            <div className="treatment-card_image image-container">
              <img src={service.image} alt={service.name} loading="lazy" className="image-cover" />
            </div>
          );

          const content = (
            <div className="treatment-card_body">
              <div className="body-m text-color-gray">{service.description}</div>
              <div className="treatment-card_price-row">
                <span className="caption-s text-color-gray">Add-on</span>
                <span className="price-row_value">{service.price}</span>
              </div>
            </div>
          );

          return (
            <Reveal as="section" key={section.anchor} id={section.anchor} className="padding-section-global">
              <div className="padding-global">
                <div className="container-large">
                  <div className="section-header">
                    <div className="eyebrow-s text-style-allcaps">{section.eyebrow}</div>
                    <h2 className="header-l">{service.name}</h2>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2 md:items-center">
                    {section.imageFirst ? (
                      <>
                        {media}
                        {content}
                      </>
                    ) : (
                      <>
                        {content}
                        {media}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}

        {/* Booking CTA + price disclaimer for add-ons */}
        <div className="padding-global">
          <div className="container-large">
            <div className="spacer-large" />
            <div className="eyebrow-s text-color-gray">{priceDisclaimer}</div>

            <div className="spacer-xlarge" />
            <Link href="/contact" className="button is-secondary is-icon w-inline-block">
              <div>Book Your Treatment</div>
              <div className="button_icon w-embed">
                <ArrowRight />
              </div>
            </Link>
          </div>
        </div>

        {/* Day Spa packages */}
        <Reveal as="section" id="packages" className="padding-section-global home-locations">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">All Day Spa</div>
                <h2 className="header-l">Our spa bundles</h2>
                <p className="body-m text-color-gray">
                  Our thoughtfully curated spa bundles combine massages, treatments, and
                  rituals designed to pamper, restore balance, and leave you refreshed all day
                  long.
                </p>
              </div>

              <Suspense fallback={<MenuPackagesGridFallback />}>
                <MenuPackagesGrid />
              </Suspense>
              <div className="spacer-large" />
              <div className="eyebrow-s text-color-gray">{priceDisclaimer}</div>
            </div>
          </div>
        </Reveal>

        {/* Menu book gallery */}
        <Reveal as="section" id="gallery" className="padding-section-global home-locations">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <div className="eyebrow-s text-style-allcaps">Menu Book</div>
                <h2 className="header-l">Galeri Menu KAMA Spa 2026</h2>
                <p className="body-m text-color-gray">
                  Jelajahi menu lengkap kami sebagaimana tampil di menu book resmi — atau
                  unduh PDF-nya untuk dibawa pulang.
                </p>
              </div>

              <div className="menu-gallery">
                {menuBookPages.map((page) => (
                  <a
                    key={page.src}
                    href="/img/kama/menu/kama-menu-2026.pdf"
                    target="_blank"
                    rel="noopener"
                    className="menu-gallery_item"
                    aria-label={`Open menu book page ${page.n}`}
                  >
                    <img src={page.src} alt={`KAMA Spa menu book — page ${page.n}`} loading="lazy" />
                  </a>
                ))}
              </div>

              <div className="spacer-large" />
              <a
                href="/img/kama/menu/kama-menu-2026.pdf"
                download
                className="button is-secondary is-icon w-inline-block"
              >
                <div>Download Menu (PDF)</div>
                <div className="button_icon w-embed">
                  <ArrowRight />
                </div>
              </a>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
