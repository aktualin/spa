import { nav } from "@/data/content";
import { getNavigationData } from "@/lib/content/navigation";

import { NavigationClient } from "./navigation-client";

/** Header situs; isi menunya dikelola dari modul Menu Navigasi. */
export async function Navigation() {
  const { header, mobile } = await getNavigationData();
  return <NavigationClient header={header} mobile={mobile} bookNow={nav.bookNow} />;
}
