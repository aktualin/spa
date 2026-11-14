import type { Metadata } from "next";
import { withPageSeo } from "@/lib/content/seo";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { getMenuAddonsCached } from "@/lib/content/catalog";
import { getSiteSettings } from "@/lib/content/site";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { MenuBodyAddOns, MenuHero, MenuMassage } from "./menu-sections";
import { MenuFeatures } from "./menu-features";
import { MenuPackages } from "./menu-packages";
import { MenuBook } from "./menu-book";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/menu", {});
}

export default async function MenuPage() {
  // Add-on dikelola dari admin (kategori berjenis Add-on).
  const [additionalServices, settings, pageCopy] = await Promise.all([
    getMenuAddonsCached(),
    getSiteSettings(),
    getPageCopy(),
  ]);
  const categoryLabels: Record<string, string> = {
    Massage: copy(pageCopy, "menu.category.massage"),
    Body: copy(pageCopy, "menu.category.body"),
    Face: copy(pageCopy, "menu.category.face"),
    "Head & Scalp": copy(pageCopy, "menu.category.head"),
    Bath: copy(pageCopy, "menu.category.bath"),
  };
  const bodyAddOns = additionalServices.filter((s) => s.category === "Body");
  const { priceDisclaimer, menuScanUrls, menuPdfUrl } = settings;

  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <MenuHero pageCopy={pageCopy} />
        <MenuMassage
          categoryLabels={categoryLabels}
          priceDisclaimer={priceDisclaimer}
          pageCopy={pageCopy}
        />
        <MenuBodyAddOns
          addOns={bodyAddOns}
          categoryLabels={categoryLabels}
          pageCopy={pageCopy}
        />
        <MenuFeatures
          additionalServices={additionalServices}
          priceDisclaimer={priceDisclaimer}
          pageCopy={pageCopy}
        />
        <MenuPackages priceDisclaimer={priceDisclaimer} pageCopy={pageCopy} />
        <MenuBook menuScanUrls={menuScanUrls} menuPdfUrl={menuPdfUrl} pageCopy={pageCopy} />
      </main>
      <Footer />
    </>
  );
}