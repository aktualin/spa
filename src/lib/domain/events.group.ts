/** Pengelompokan event untuk halaman publik — lihat `events.ts`. */
import { type EventLike, eventEndsAt, isEventPast } from "./events.phase.ts";

const bySortOrder = (a: EventLike, b: EventLike) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

/**
 * Membagi event menjadi upcoming, past, dan past collaborations.
 * Urutan: "Urutan tampil" (kecil di atas), lalu tanggal — upcoming tanggal
 * terdekat lebih dulu (tanggal menyusul paling akhir), past & kolaborasi
 * terbaru lebih dulu.
 */
export function groupEvents<T extends EventLike>(
  events: readonly T[],
  now: Date = new Date(),
): { upcoming: T[]; past: T[]; collaborations: T[] } {
  const upcoming: T[] = [];
  const past: T[] = [];
  const collaborations: T[] = [];

  for (const event of events) {
    if (!isEventPast(event, now)) upcoming.push(event);
    else if (event.isCollaboration) collaborations.push(event);
    else past.push(event);
  }

  upcoming.sort(
    (a, b) =>
      bySortOrder(a, b) ||
      (a.startDate?.getTime() ?? Infinity) - (b.startDate?.getTime() ?? Infinity),
  );
  const newestFirst = (a: T, b: T) =>
    bySortOrder(a, b) ||
    (eventEndsAt(b)?.getTime() ?? 0) - (eventEndsAt(a)?.getTime() ?? 0);
  past.sort(newestFirst);
  collaborations.sort(newestFirst);

  return { upcoming, past, collaborations };
}