import { getSiteSettings } from "@/lib/content/site";
import { getNavigationData } from "@/lib/content/navigation";
import { whatsAppHref } from "@/lib/content/whatsapp";

import { NavigationClient } from "./navigation-client";

/** Header situs; isi menunya dikelola dari modul Menu Navigasi. */
export async function Navigation() {
  const [{ header, mobile }, whatsappHref, settings] = await Promise.all([
    getNavigationData(),
    whatsAppHref("default"),
    getSiteSettings(),
  ]);
  return (
    <NavigationClient
      header={header}
      mobile={mobile}
      bookNow={settings.bookNowLabel}
      bookNowHref={settings.bookNowHref}
      whatsappHref={whatsappHref}
    />
  );
}
