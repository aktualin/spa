import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { AdditionalService } from "@/data/content";
import { toPlainText } from "@/lib/domain/rich-text";
import { AddonImage, AddonPriceRow, MenuPriceDisclaimer } from "./menu-shared";

/** Section satu layanan (face/head/bath) + CTA booking di bawahnya. */
export function MenuFeatures({
  additionalServices,
  priceDisclaimer,
  pageCopy,
}: {
  additionalServices: AdditionalService[];
  priceDisclaimer: string;
  pageCopy: PageCopy;
}) {
  const featureSections = [
    {
      anchor: "face",
      eyebrow: copy(pageCopy, "menu.feature.face.eyebrow"),
      imageFirst: true,
    },
    {
      anchor: "head",
      eyebrow: copy(pageCopy, "menu.feature.head.eyebrow"),
      imageFirst: false,
    },
    {
      anchor: "bath",
      eyebrow: copy(pageCopy, "menu.feature.bath.eyebrow"),
      imageFirst: true,
    },
  ] as const;
  const bookingHref = copy(pageCopy, "menu.booking_cta_href") || "/contact";

  return (
    <>
      {/* Single-service features */}
      {featureSections.map((section) => {
        const service = additionalServices.find((s) => s.anchor === section.anchor);

        if (!service) return null;

        const media = <AddonImage src={service.image} alt={service.name} />;

        const content = (
          <div className="treatment-card_body">
            <div className="body-m text-color-gray">{toPlainText(service.description)}</div>
            <AddonPriceRow price={service.price} pageCopy={pageCopy} />
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
          <MenuPriceDisclaimer text={priceDisclaimer} />

          <div className="spacer-xlarge" />
          <Link href={bookingHref} className="button is-secondary is-icon w-inline-block">
            <div>{copy(pageCopy, "menu.booking_label")}</div>
            <div className="button_icon w-embed">
              <ArrowRight />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}