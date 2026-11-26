/** Tanggal publikasi dalam format English day-first; `null` kalau belum dijadwalkan. */
export function formatPublishedAt(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
