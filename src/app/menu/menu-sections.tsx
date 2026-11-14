import { Suspense } from "react";
import { Reveal } from "@/components/reveal";
import {
  MenuTreatmentsGrid,
  MenuTreatmentsGridFallback,
} from "@/components/public/menu-data";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { AdditionalService } from "@/data/content";
import { toPlainText } from "@/lib/domain/rich-text";
import { AddonImage, AddonPriceRow, MenuPriceDisclaimer } from "./menu-shared";

/** Hero halaman menu. */
export function MenuHero({ pageCopy }: { pageCopy: PageCopy }) {
  return (
    <Reveal as="section" className="page-hero">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "menu.hero.eyebrow")}</div>
            <h1 className="header-xxl">{copy(pageCopy, "menu.hero.title")}</h1>
            <div className="spacer-medium" />
            {copy(pageCopy, "menu.hero.description") ? (
              <p className="body-m text-color-gray">
                {copy(pageCopy, "menu.hero.description")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** Section massage: grid treatment dari database + disclaimer harga. */
export function MenuMassage({
  categoryLabels,
  priceDisclaimer,
  pageCopy,
}: {
  categoryLabels: Record<string, string>;
  priceDisclaimer: string;
  pageCopy: PageCopy;
}) {
  return (
    <Reveal as="section" id="massage" className="padding-section-global">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "menu.massage.eyebrow")}</div>
            <h2 className="header-l">{copy(pageCopy, "menu.massage.title")}</h2>
          </div>

          <Suspense fallback={<MenuTreatmentsGridFallback />}>
            <MenuTreatmentsGrid categoryLabels={categoryLabels} />
          </Suspense>
          <MenuPriceDisclaimer text={priceDisclaimer} />
        </div>
      </div>
    </Reveal>
  );
}

/** Section Body & Scrub: kartu add-on berkategori Body. */
export function MenuBodyAddOns({
  addOns,
  categoryLabels,
  pageCopy,
}: {
  addOns: AdditionalService[];
  categoryLabels: Record<string, string>;
  pageCopy: PageCopy;
}) {
  return (
    <Reveal as="section" id="body" className="padding-section-global">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "menu.addons.eyebrow")}</div>
            <h2 className="header-l">{copy(pageCopy, "menu.addons.title")}</h2>
          </div>

          <div className="w-layout-grid whats-new_list">
            {addOns.map((s) => (
              <div key={s.name} className="treatment-card w-dyn-item">
                <AddonImage src={s.image} alt={s.name} />
                <div className="treatment-card_body">
                  <div className="eyebrow-s text-style-allcaps">{categoryLabels[s.category]}</div>
                  <h3 className="header-s">{s.name}</h3>
                  <div className="body-m text-color-gray">{toPlainText(s.description)}</div>
                  <AddonPriceRow price={s.price} pageCopy={pageCopy} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}