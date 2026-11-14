import { Suspense } from "react";
import { Reveal } from "@/components/reveal";
import {
  MenuPackagesGrid,
  MenuPackagesGridFallback,
} from "@/components/public/menu-data";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { MenuPriceDisclaimer } from "./menu-shared";

/** Section Day Spa packages: grid paket dari database + disclaimer harga. */
export function MenuPackages({
  priceDisclaimer,
  pageCopy,
}: {
  priceDisclaimer: string;
  pageCopy: PageCopy;
}) {
  return (
    <Reveal as="section" id="packages" className="padding-section-global home-locations">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "menu.packages.eyebrow")}</div>
            <h2 className="header-l">{copy(pageCopy, "menu.packages.title")}</h2>
            {copy(pageCopy, "menu.packages.description") ? (
              <p className="body-m text-color-gray">
                {copy(pageCopy, "menu.packages.description")}
              </p>
            ) : null}
          </div>

          <Suspense fallback={<MenuPackagesGridFallback />}>
            <MenuPackagesGrid />
          </Suspense>
          <MenuPriceDisclaimer text={priceDisclaimer} />
        </div>
      </div>
    </Reveal>
  );
}