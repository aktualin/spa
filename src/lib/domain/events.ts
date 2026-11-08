/**
 * Pengelompokan event.
 *
 * "Upcoming events" = event yang belum selesai (startDate di masa depan atau
 * sedang berjalan). Sisanya adalah riwayat. Event `isCollaboration` selalu
 * masuk kelompok "past collaborations", terlepas dari tanggalnya (U6).
 */

export type EventLike = {
  startDate?: Date | null;
  endDate?: Date | null;
  isCollaboration?: boolean;
};

export function isEventUpcoming(
  event: EventLike,
  now: Date = new Date(),
): boolean {
  const end = event.endDate ?? event.startDate;
  // Event tanpa tanggal dianggap masih relevan — ditampilkan sebagai upcoming.
  if (!end) return true;
  return end.getTime() >= now.getTime();
}

export function isEventPast(
  event: EventLike,
  now: Date = new Date(),
): boolean {
  return !isEventUpcoming(event, now);
}

/** Membagi event menjadi akan datang, sudah lewat, dan kolaborasi. */
export function groupEvents<T extends EventLike>(
  events: T[],
  now: Date = new Date(),
): { upcoming: T[]; past: T[]; collaborations: T[] } {
  const upcoming: T[] = [];
  const past: T[] = [];
  const collaborations: T[] = [];

  for (const event of events) {
    if (event.isCollaboration) collaborations.push(event);
    else if (isEventUpcoming(event, now)) upcoming.push(event);
    else past.push(event);
  }

  // Yang akan datang: tanggal terdekat lebih dulu. Yang lalu: terbaru dulu.
  upcoming.sort((a, b) => {
    const at = a.startDate?.getTime() ?? Infinity;
    const bt = b.startDate?.getTime() ?? Infinity;
    return at - bt;
  });
  const newestFirst = (a: T, b: T) =>
    (b.startDate?.getTime() ?? 0) - (a.startDate?.getTime() ?? 0);
  past.sort(newestFirst);
  collaborations.sort(newestFirst);

  return { upcoming, past, collaborations };
}
