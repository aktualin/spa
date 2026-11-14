import { getSiteSettings } from "@/lib/content/site";
import { getNavigationData } from "@/lib/content/navigation";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { whatsAppHref } from "@/lib/content/whatsapp";

import { NavigationClient } from "./navigation-client";

/** Header situs; isi menunya dikelola dari modul Menu Navigasi. */
export async function Navigation() {
  const [{ header, mobile }, whatsappHref, settings, pageCopy] = await Promise.all([
    getNavigationData(),
    whatsAppHref("default"),
    getSiteSettings(),
    getPageCopy(),
  ]);
  return (
    <NavigationClient
      header={header}
      mobile={mobile}
      bookNow={settings.bookNowLabel}
      bookNowHref={settings.bookNowHref}
      whatsappHref={whatsappHref}
      brand={{
        markLightUrl: settings.logoMarkLightUrl,
        markDarkUrl: settings.logoMarkDarkUrl,
        wordmarkTop: settings.brandWordmarkTop,
        wordmarkBottom: settings.brandWordmarkBottom,
        alt: settings.brandLogoAlt,
      }}
      navAria={copy(pageCopy, "global.nav_aria") || "Global"}
      navOpen={copy(pageCopy, "global.nav_open") || "Buka menu"}
      navClose={copy(pageCopy, "global.nav_close") || "Tutup menu"}
      fabAria={copy(pageCopy, "global.fab_aria") || "Chat via WhatsApp"}
    />
  );
}