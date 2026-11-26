/** Pairing old↔new, klasifikasi frozen/guarded, resolver target MenuItem. */
import { nav, footerLinks } from "../../src/data/content.ts";
import { buildStaticMenuSeed } from "../../src/lib/domain/menu-seed.ts";
import { sqlString } from "./sql.mts";
import type { CopyRow } from "./collect.types.mts";

export type Emitter = {
  fwd: string[];
  rev: string[];
  changed: number;
  coverage: Map<string, number>;
};

/** Frozen = tanpa editor admin → UPDATE unconditional (konvergen, idempotent). */
const FROZEN_TABLES = new Set(["ContentBlock", "MenuItem", "PageSeo", "Branch"]);
const FROZEN_FIELDS: Record<string, string[]> = {
  SiteSettings: [
    "seoSiteName", "seoDefaultTitle", "seoDefaultDescription",
    "seoOgDescription", "seoOgLocale", "seoTitleTemplate", "seoKeywords",
  ],
  StaticPage: ["title"],
};

export const isFrozen = (t: string, f: string): boolean =>
  FROZEN_TABLES.has(t) || (FROZEN_FIELDS[t]?.includes(f) ?? false);
export const deepEq = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
export const rowKey = (r: CopyRow): string => r.table + "|" + JSON.stringify(r.match);

const menuByKey = new Map(buildStaticMenuSeed(nav, footerLinks).map((i) => [i.key, i]));

/** Target DB MenuItem: root by panelKey/url; anak services by id tetap nav_restructure. */
export function menuWhere(key: string): string {
  const item = menuByKey.get(key);
  if (!item) throw new Error(`MenuItem key tidak dikenal: ${key}`);
  if (!item.parentKey) {
    if (item.panelKey)
      return `"panelKey" = ${sqlString(item.panelKey)} AND "parentId" IS NULL AND 'HEADER' = ANY("locations")`;
    return `"url" = ${sqlString(item.url ?? "")} AND "parentId" IS NULL AND 'HEADER' = ANY("locations")`;
  }
  const root = menuByKey.get(item.parentKey.split("-col-")[0]);
  if (root?.panelKey === "services") {
    const m = key.match(/^header-\d+-col-(\d+)(?:-(\d+))?$/);
    if (m) {
      const id = m[2] === undefined ? `menu-services-col-${m[1]}` : `menu-services-link-${m[2]}`;
      return `"id" = ${sqlString(id)}`;
    }
  }
  throw new Error(`Target MenuItem tidak terpetakan untuk ${key}`);
}
