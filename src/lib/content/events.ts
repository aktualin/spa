/**
 * Bacaan publik event (`EventItem` + `EventPhoto`).
 *
 * Status upcoming/past/collaborations memakai aturan di `@/lib/domain/events`
 * dan dievaluasi DI DALAM fungsi `"use cache"` dengan `cacheLife("minutes")`:
 * event yang baru lewat pindah kelompok paling lambat beberapa menit kemudian
 * tanpa deploy ulang, dan tulisan admin langsung terbaca lewat `updateTag`.
 *
 * Detail per slug membaca langsung dari database (cache di-key slug), bukan
 * menyaring daftar — event yang dibuat setelah build tetap ditemukan.
 *
 * DB kosong/down → daftar kosong; halaman menampilkan pesan ramah.
 * Implementasinya dipecah ke `events.types.ts` dan `events.queries.ts`;
 * berkas ini hanya mengekspor ulang simbol publiknya.
 */

export type { PublicEventPhoto, PublicEvent, EventGroups } from "./events.types";
export { getEventGroups, getEvent, getEventSlugs } from "./events.queries";