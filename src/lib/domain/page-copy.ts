/**
 * Registry teks halaman publik (`ContentBlock`).
 *
 * Hanya METADATA: label, tipe isian, dan batas panjang. Nilai teks tinggal di
 * database (diisi `scripts/seed-content.mts` / admin). Dipakai bersama oleh
 * form admin "Teks Halaman" dan validasi Server Action.
 *
 * Daftar grup dipecah ke berkas `page-copy.groups-*.ts` agar tiap berkas
 * tetap kecil; urutan grup di sini adalah urutan tampil di form admin.
 */
import { CATALOG_GROUPS } from "./page-copy.groups-catalog.ts";
import { CORPORATE_GROUPS } from "./page-copy.groups-corporate.ts";
import { EVENTS_GROUPS } from "./page-copy.groups-events.ts";
import { GLOBAL_GROUPS } from "./page-copy.groups-global.ts";
import { MEMBERSHIP_GROUPS } from "./page-copy.groups-membership.ts";
import { MICROCOPY_GROUPS } from "./page-copy.groups-microcopy.ts";
import { PAGES_GROUPS } from "./page-copy.groups-pages.ts";
import { STORY_GROUPS } from "./page-copy.groups-story.ts";
import type { PageCopyField, PageCopyGroup } from "./page-copy.types.ts";

export type {
  PageCopyFieldType,
  PageCopyField,
  PageCopyGroup,
} from "./page-copy.types.ts";

export const PAGE_COPY_GROUPS: readonly PageCopyGroup[] = [
  ...GLOBAL_GROUPS,
  ...MEMBERSHIP_GROUPS,
  ...CATALOG_GROUPS,
  ...STORY_GROUPS,
  ...CORPORATE_GROUPS,
  ...EVENTS_GROUPS,
  ...PAGES_GROUPS,
  ...MICROCOPY_GROUPS,
];

export const PAGE_COPY_FIELDS: readonly PageCopyField[] = PAGE_COPY_GROUPS.flatMap(
  (group) => group.fields,
);

const FIELDS_BY_KEY = new Map(PAGE_COPY_FIELDS.map((field) => [field.key, field]));

export function pageCopyField(key: string): PageCopyField | null {
  return FIELDS_BY_KEY.get(key) ?? null;
}

export function isPageCopyGroup(group: string): boolean {
  return PAGE_COPY_GROUPS.some((entry) => entry.group === group);
}