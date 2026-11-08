/**
 * Menu navigasi publik (modul Menu Navigasi) untuk header, menu mobile, dan
 * footer. Tabel kosong atau database tidak terbaca → menu kosong; navigasi
 * sepenuhnya mengikuti apa yang disusun admin.
 */
import { cacheLife, cacheTag } from "next/cache";

import { nav as staticNav, type NavLink } from "@/data/content";
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

const EMPTY_NAVIGATION: NavigationData = {
  header: { primary: [], megaGroups: {} },
  mobile: { primary: [], megaGroups: {} },
  footer: {},
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
  }, EMPTY_NAVIGATION);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}
