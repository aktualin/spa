/**
 * Aturan "request mana yang dihitung sebagai tampilan halaman" — logika murni
 * tanpa Next.js/Prisma supaya bisa diuji unit. Dipakai src/proxy.ts lewat
 * src/lib/analytics/track.ts.
 *
 * Proxy hanya menghitung muat penuh dokumen publik (GET, `text/html`). Next
 * membuang header prefetch/RSC sebelum proxy, jadi navigasi client-side
 * dicatat oleh src/instrumentation-client.ts → /api/analytics/view.
 * Prefetch, bot/crawler, berkas statis, API, dan area /admin tidak dihitung.
 *
 * Tidak ada IP atau User-Agent yang disimpan; `visitorId` dibuat acak dan
 * disimpan di cookie httpOnly.
 */

import { isBotUserAgent, trackablePath } from "./page-view.path.ts";

export { trackablePath, isBotUserAgent } from "./page-view.path.ts";

/** Nama cookie identitas pengunjung. Hanya dibaca server. */
export const VISITOR_COOKIE = "kama_visitor_id";

export type PageViewRequest = {
  method: string;
  pathname: string;
  headers: { get(name: string): string | null };
  /** Request membawa cookie sesi admin → jangan cemari data pengunjung. */
  hasAdminSession: boolean;
};

/**
 * Path yang harus dicatat untuk request ini, atau null bila bukan navigasi
 * halaman publik yang layak dihitung.
 */
export function trackablePageView(request: PageViewRequest): string | null {
  if (request.method !== "GET") return null;
  if (request.hasAdminSession) return null;

  const { headers } = request;

  // Prerender/prefetch browser (Speculation Rules) bukan kunjungan sungguhan.
  const purpose = (
    headers.get("purpose") ??
    headers.get("sec-purpose") ??
    ""
  ).toLowerCase();
  if (purpose.includes("prefetch")) return null;

  // Hanya muat penuh dokumen. Request RSC/prefetch memakai `Accept: */*` dan
  // `Sec-Fetch-Dest: empty`; gambar/skrip/font juga tidak dihitung.
  const destination = headers.get("sec-fetch-dest");
  if (destination && destination !== "document") return null;
  if (!(headers.get("accept") ?? "").includes("text/html")) return null;

  if (isBotUserAgent(headers.get("user-agent"))) return null;

  return trackablePath(request.pathname);
}