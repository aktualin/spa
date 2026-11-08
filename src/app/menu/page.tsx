import type { Metadata } from "next";
import { withPageSeo } from "@/lib/content/seo";
import Link from "next/link";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "@/components/icons";
import { getMenuAddonsCached } from "@/lib/content/catalog";
import { getSiteSettings } from "@/lib/content/site";
import {
  MenuPackagesGrid,
  MenuPackagesGridFallback,
  MenuTreatmentsGrid,
  MenuTreatmentsGridFallback,
} from "@/components/public/menu-data";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/menu", {
    title: "Menu Treatments",
    description:
      "KAMA Spa menu — massage, body scrub, face ritual, head & scalp treatment, bath ritual, dan paket All Day Spa.",
  });
}

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

export default async function MenuPage() {
  // Add-on dikelola dari admin (kategori berjenis Add-on).
  const [additionalServices, settings] = await Promise.all([
    getMenuAddonsCached(),
    getSiteSettings(),
  ]);
  const bodyAddOns = additionalServices.filter((s) => s.category === "Body");
  const { priceDisclaimer, menuScanUrls, menuPdfUrl } = settings;

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
              {priceDisclaimer ? (
                <>
                  <div className="spacer-large" />
                  <div className="eyebrow-s text-color-gray">{priceDisclaimer}</div>
                </>
              ) : null}
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
            {priceDisclaimer ? (
              <>
                <div className="spacer-large" />
                <div className="eyebrow-s text-color-gray">{priceDisclaimer}</div>
              </>
            ) : null}

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
              {priceDisclaimer ? (
                <>
                  <div className="spacer-large" />
                  <div className="eyebrow-s text-color-gray">{priceDisclaimer}</div>
                </>
              ) : null}
            </div>
          </div>
        </Reveal>

        {/* Menu book gallery — halaman scan & PDF-nya dikelola dari admin. */}
        {menuScanUrls.length > 0 || menuPdfUrl ? (
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

                {menuScanUrls.length > 0 ? (
                  <div className="menu-gallery">
                    {menuScanUrls.map((src, index) => {
                      const page = index + 1;
                      const image = (
                        <img
                          src={src}
                          alt={`KAMA Spa menu book — page ${page}`}
                          loading="lazy"
                        />
                      );
                      // Tanpa PDF, halaman menu tetap tampil tetapi tidak bisa diklik.
                      return menuPdfUrl ? (
                        <a
                          key={src}
                          href={menuPdfUrl}
                          target="_blank"
                          rel="noopener"
                          className="menu-gallery_item"
                          aria-label={`Open menu book page ${page}`}
                        >
                          {image}
                        </a>
                      ) : (
                        <div key={src} className="menu-gallery_item">
                          {image}
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {menuPdfUrl ? (
                  <>
                    <div className="spacer-large" />
                    <a
                      href={menuPdfUrl}
                      download
                      className="button is-secondary is-icon w-inline-block"
                    >
                      <div>Download Menu (PDF)</div>
                      <div className="button_icon w-embed">
                        <ArrowRight />
                      </div>
                    </a>
                  </>
                ) : null}
              </div>
            </div>
          </Reveal>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
