/** State aktif navigasi: cocokkan pathname dengan href item nav (murni, teruji). */
import type { NavMegaGroup, NavPrimaryItem } from "../../data/content.ts";

/** pathname tanpa query/hash; href kosong dianggap "/". */
export function pathOf(href: string): string {
  return href.split(/[?#]/)[0] || "/";
}

/** Tautan biasa: aktif bila pathname cocok persis. */
export function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === pathOf(href);
}

/** Pemicu mega: aktif bila di rute root (atau anaknya) atau salah satu tautan kolom. */
export function isNavGroupActive(
  pathname: string,
  item: NavPrimaryItem,
  group: NavMegaGroup,
): boolean {
  const root = pathOf(item.href);
  if (root !== "/" && (pathname === root || pathname.startsWith(`${root}/`))) {
    return true;
  }
  return group.columns.some((column) =>
    column.links.some((link) => pathOf(link.href) === pathname),
  );
}