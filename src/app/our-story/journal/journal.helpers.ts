/** Tanggal publikasi dalam format Indonesia; `null` kalau belum dijadwalkan. */
export function formatPublishedAt(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}