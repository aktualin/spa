import { nav } from "@/data/content";
import { getNavigationData } from "@/lib/content/navigation";
import { whatsAppHref } from "@/lib/content/whatsapp";

import { NavigationClient } from "./navigation-client";

/** Header situs; isi menunya dikelola dari modul Menu Navigasi. */
export async function Navigation() {
  const [{ header, mobile }, whatsappHref] = await Promise.all([
    getNavigationData(),
    whatsAppHref("default"),
  ]);
  return (
    <NavigationClient
      header={header}
      mobile={mobile}
      bookNow={nav.bookNow}
      whatsappHref={whatsappHref}
    />
  );
}
