/**
 * Kumpulkan baris copy kanonik dari modul data/seed (tanpa DB).
 * Dipakai generator migrasi (nilai baru) dan ekstraksi HEAD (nilai lama).
 *
 *   node scripts/english-copy/collect.mts out.json
 */
import "../load-env.mts";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { contentBlocks, homepageSections, siteSettings, whatsAppTemplates } from "./collect.copy.mts";
import { pageSeo, menuItems } from "./collect.nav.mts";
import { catalog } from "./collect.catalog.mts";
import { membershipProgram, membershipTiers, giftCard } from "./collect.membership.mts";
import { journal, corporate, branches, legalPages } from "./collect.pages.mts";
import type { CopyRow } from "./collect.types.mts";

export type { CopyRow } from "./collect.types.mts";

export function collectAll(): CopyRow[] {
  return [
    ...contentBlocks(),
    ...homepageSections(),
    ...siteSettings(),
    ...whatsAppTemplates(),
    ...pageSeo(),
    ...menuItems(),
    ...catalog(),
    ...membershipProgram(),
    ...membershipTiers(),
    ...giftCard(),
    ...journal(),
    ...corporate(),
    ...branches(),
    ...legalPages(),
  ];
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain && process.argv[2]) {
  const rows = collectAll();
  writeFileSync(process.argv[2], JSON.stringify(rows, null, 2));
  console.log(`${rows.length} baris copy → ${process.argv[2]}`);
}
