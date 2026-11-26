/** Copy navigasi & SEO per route: PageSeo (routes seed) + MenuItem. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { nav, footerLinks } from "../../src/data/content.ts";
import { buildStaticMenuSeed } from "../../src/lib/domain/menu-seed.ts";
import { row, type CopyRow } from "./collect.types.mts";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Routes PageSeo persis seperti ditulis `seedPageSeo` (literal di seed.mts).
 * Registry PAGE_SEO_DEFAULTS bisa berbeda dari nilai live, jadi sumbernya
 * teks seed.mts itu sendiri — berlaku sama di pohon HEAD maupun current.
 */
export function pageSeo(): CopyRow[] {
  const seed = readFileSync(join(here, "..", "seed.mts"), "utf8");
  const m = seed.match(/const routes = (\[[\s\S]*?\]);/);
  if (!m) throw new Error("routes PageSeo tidak ditemukan di seed.mts");
  const routes = new Function(`return ${m[1]}`)() as {
    path: string;
    title: string;
    description: string;
  }[];
  return routes.map((r) =>
    row("PageSeo", { path: r.path }, { title: r.title, description: r.description }),
  );
}

export function menuItems(): CopyRow[] {
  return buildStaticMenuSeed(nav, footerLinks).map((item) =>
    row("MenuItem", { key: item.key }, {
      label: item.label,
      panelLinkLabel: item.panelLinkLabel ?? null,
      highlightLabel: item.highlightLabel ?? null,
      highlightBadge: item.highlightBadge ?? null,
      highlightEyebrow: item.highlightEyebrow ?? null,
    }),
  );
}
