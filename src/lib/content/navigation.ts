/**
 * Menu navigasi publik (modul Menu Navigasi) untuk header, menu mobile, dan
 * footer. Bila tabel kosong atau database tidak terbaca, mengembalikan menu
 * statis lama (`nav`, `footerLinks`) — tampilannya identik.
 */
import { cacheLife, cacheTag } from "next/cache";

import { footerLinks as staticFooterLinks, nav as staticNav, type NavLink } from "@/data/content";
import { buildMenuTree, type MenuRow } from "@/lib/domain/menu";
import {
  menuTreeToFooter,
  menuTreeToNav,
  presetsFromMegaGroups,
  type NavData,
} from "@/lib/domain/menu-nav";
import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type NavigationData = {
  header: NavData;
  mobile: NavData;
  footer: Record<string, NavLink[]>;
};

const STATIC_NAVIGATION: NavigationData = {
  header: { primary: staticNav.primary, megaGroups: staticNav.megaGroups },
  mobile: { primary: staticNav.primary, megaGroups: staticNav.megaGroups },
  footer: staticFooterLinks,
};

export async function getNavigationData(): Promise<NavigationData> {
  "use cache";
  cacheTag(CONTENT_TAGS.menu);
  // Item bertipe PAGE mengikuti slug & status halaman.
  cacheTag(CONTENT_TAGS.pages);

  const { data, usedFallback } = await safeQueryWithMeta<NavigationData>(async () => {
    const { prisma } = await import("@/lib/prisma");
    const items = await prisma.menuItem.findMany({
      include: { page: { select: { slug: true, status: true } } },
    });
    if (items.length === 0) throw new Error("menu kosong");

    const rows: MenuRow[] = items.map((item) => ({
      id: item.id,
      parentId: item.parentId,
      label: item.label,
      linkType: item.linkType,
      url: item.url,
      pageId: item.pageId,
      page: item.page
        ? { slug: item.page.slug, published: item.page.status === "PUBLISHED" }
        : null,
      sortOrder: item.sortOrder,
      isVisible: item.isVisible,
      openInNew: item.openInNew,
      locations: item.locations,
      panelKey: item.panelKey,
      panelLinkLabel: item.panelLinkLabel,
    }));

    // Kartu highlight & lebar panel belum punya modul admin; diambil dari
    // preset menu lama berdasarkan panelKey.
    const presets = presetsFromMegaGroups(staticNav.megaGroups);
    return {
      header: menuTreeToNav(buildMenuTree(rows, "HEADER"), presets),
      mobile: menuTreeToNav(buildMenuTree(rows, "MOBILE"), presets),
      footer: menuTreeToFooter(buildMenuTree(rows, "FOOTER")),
    };
  }, STATIC_NAVIGATION);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
