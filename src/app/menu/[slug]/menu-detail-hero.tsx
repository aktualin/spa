import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { Package, Treatment } from "@/data/content";

/** Hero detail menu: eyebrow kategori/paket, nama, dan tagline/subtitle. */
export function MenuDetailHero({
  entry,
  pageCopy,
}: {
  entry: Treatment | Package;
  pageCopy: PageCopy;
}) {
  return (
    <section className="page-hero">
      <div className="padding-global">
        <div className="container-large">
          <div className="layout-row gap-large">
            <div className="sizing-grow">
              <div className="eyebrow-s text-style-allcaps">
                {entry.kind === "package"
                  ? copy(pageCopy, "menu.packages.eyebrow")
                  : entry.category}
              </div>
              <h1 className="header-xxl">{entry.name}</h1>
              <div className="body-m text-color-gray">
                {entry.kind === "package" ? entry.subtitle : entry.tagline}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}