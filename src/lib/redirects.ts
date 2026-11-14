/**
 * Data yang dibaca src/proxy.ts di setiap request publik: peta redirect
 * (tabel `Redirect`), daftar slug halaman terbit (`StaticPage`), dan periode
 * promo (`Promo`, untuk 404 promo yang tidak aktif), serta status terbit artikel
 * journal (`JournalPost`, untuk 404 artikel yang tidak terlihat). Disimpan
 * di memori dengan TTL supaya proxy tidak menanyai database di setiap request.
 *
 * Implementasinya dipecah ke berkas `redirects.*.ts` di folder ini; berkas
 * ini hanya mengekspor ulang simbol publiknya.
 */

export { type Cached } from "./redirects.loader";
export { getRedirectMap, getPublishedPageSlugs } from "./redirects.map";
export {
  type PromoPeriod,
  getPromoPeriods,
  fetchPromoPeriod,
} from "./redirects.promos";
export {
  type JournalVisibility,
  getJournalVisibility,
  fetchJournalVisibility,
} from "./redirects.journal";
export {
  getPublishedEventSlugs,
  fetchEventPublished,
} from "./redirects.events";