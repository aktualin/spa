import { copy, type PageCopy } from "@/lib/content/page-copy";

/** Bagian kecil bersama halaman /menu — markup identik dengan asalnya. */

/** Disclaimer harga di bawah grid: spacer-large + eyebrow. */
export function MenuPriceDisclaimer({ text }: { text: string }) {
  return text ? (
    <>
      <div className="spacer-large" />
      <div className="eyebrow-s text-color-gray">{text}</div>
    </>
  ) : null;
}

/** Gambar kartu add-on (rasio mengikuti treatment-card_image). */
export function AddonImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="treatment-card_image image-container">
      <img src={src} alt={alt} loading="lazy" className="image-cover" />
    </div>
  );
}

/** Baris harga add-on: label "Add-on" + nilai harga. */
export function AddonPriceRow({ price, pageCopy }: { price: string; pageCopy: PageCopy }) {
  return (
    <div className="treatment-card_price-row">
      <span className="caption-s text-color-gray">{copy(pageCopy, "menu.addon_label")}</span>
      <span className="price-row_value">{price}</span>
    </div>
  );
}