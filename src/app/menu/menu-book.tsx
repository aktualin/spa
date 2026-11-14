import { fillCopy } from "@/components/copy-text";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { copy, type PageCopy } from "@/lib/content/page-copy";

/** Menu book gallery — halaman scan & PDF-nya dikelola dari admin. */
export function MenuBook({
  menuScanUrls,
  menuPdfUrl,
  pageCopy,
}: {
  menuScanUrls: string[];
  menuPdfUrl: string;
  pageCopy: PageCopy;
}) {
  if (menuScanUrls.length === 0 && !menuPdfUrl) return null;

  const scanAlt = copy(pageCopy, "menu.scan_alt") || "KAMA Spa menu book — page {n}";
  const scanAria = copy(pageCopy, "menu.scan_aria") || "Open menu book page {n}";

  return (
    <Reveal as="section" id="gallery" className="padding-section-global home-locations">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <div className="eyebrow-s text-style-allcaps">{copy(pageCopy, "menu.menu_book.eyebrow")}</div>
            <h2 className="header-l">{copy(pageCopy, "menu.menu_book.title")}</h2>
            {copy(pageCopy, "menu.menu_book.description") ? (
              <p className="body-m text-color-gray">
                {copy(pageCopy, "menu.menu_book.description")}
              </p>
            ) : null}
          </div>

          {menuScanUrls.length > 0 ? (
            <div className="menu-gallery">
              {menuScanUrls.map((src, index) => {
                const page = index + 1;
                const image = (
                  <img
                    src={src}
                    alt={fillCopy(scanAlt, { n: page })}
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
                    aria-label={fillCopy(scanAria, { n: page })}
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
                <div>{copy(pageCopy, "menu.menu_book.download_label")}</div>
                <div className="button_icon w-embed">
                  <ArrowRight />
                </div>
              </a>
            </>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}