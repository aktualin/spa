/** Komposisi status Journal untuk donut chart — lihat `admin-dashboard.ts`. */

export type JournalStatusKey = "PUBLISHED" | "SCHEDULED" | "DRAFT";

export type JournalStatusSegment = {
  key: JournalStatusKey;
  label: string;
  value: number;
  /** Porsi 0–1 terhadap total; 0 saat total masih kosong. */
  share: number;
};

const JOURNAL_STATUS_META: readonly {
  key: JournalStatusKey;
  label: string;
}[] = [
  { key: "PUBLISHED", label: "Terbit" },
  { key: "SCHEDULED", label: "Terjadwal" },
  { key: "DRAFT", label: "Draf" },
];

/** Komposisi status Journal untuk donut chart; urut terbit → terjadwal → draf. */
export function journalStatusSegments(
  counts: Readonly<Record<JournalStatusKey, number>>,
): JournalStatusSegment[] {
  const total = JOURNAL_STATUS_META.reduce(
    (sum, item) => sum + Math.max(0, counts[item.key] ?? 0),
    0,
  );

  return JOURNAL_STATUS_META.map((item) => {
    const value = Math.max(0, counts[item.key] ?? 0);
    return {
      key: item.key,
      label: item.label,
      value,
      share: total === 0 ? 0 : value / total,
    };
  });
}