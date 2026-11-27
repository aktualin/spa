/**
 * Konstanta status artikel journal.
 *
 * File ini sengaja BUKAN "use server" supaya konstanta boleh diimpor baik dari
 * Server Action (module "use server" hanya boleh mengekspor async function)
 * maupun dari komponen client.
 */

export const JOURNAL_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED"] as const;

export type JournalStatus = (typeof JOURNAL_STATUSES)[number];

/** Label & warna badge status artikel journal. */
export const journalStatusMeta: Record<
  JournalStatus,
  { label: string; tone: "muted" | "blue" | "green" }
> = {
  DRAFT: { label: "Draft", tone: "muted" },
  SCHEDULED: { label: "Scheduled", tone: "blue" },
  PUBLISHED: { label: "Published", tone: "green" },
};
