/** Status event berdasarkan tanggal — lihat `events.ts`. */
import { endOfWibDay } from "./events.time.ts";

export type EventPhase = "upcoming" | "ongoing" | "past" | "tba";

export type EventLike = {
  startDate?: Date | null;
  endDate?: Date | null;
  isCollaboration?: boolean;
  sortOrder?: number | null;
};

export const EVENT_PHASE_LABEL: Record<EventPhase, string> = {
  upcoming: "Akan datang",
  ongoing: "Sedang berlangsung",
  past: "Sudah lewat",
  tba: "Tanggal menyusul",
};

/** Saat event dianggap selesai; null bila event belum punya tanggal. */
export function eventEndsAt(event: EventLike): Date | null {
  if (event.endDate) return event.endDate;
  if (event.startDate) return endOfWibDay(event.startDate);
  return null;
}

/** Status event pada waktu `now` (lihat aturan di atas). */
export function eventPhase(event: EventLike, now: Date = new Date()): EventPhase {
  const end = eventEndsAt(event);
  if (!end) return event.isCollaboration ? "past" : "tba";
  if (end.getTime() < now.getTime()) return "past";
  if (event.startDate && event.startDate.getTime() > now.getTime()) return "upcoming";
  return "ongoing";
}

/** Event belum lewat (akan datang, sedang berlangsung, atau tanggal menyusul). */
export function isEventUpcoming(event: EventLike, now: Date = new Date()): boolean {
  return eventPhase(event, now) !== "past";
}

export function isEventPast(event: EventLike, now: Date = new Date()): boolean {
  return eventPhase(event, now) === "past";
}