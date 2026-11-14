/** Aturan path & bot untuk pencatatan halaman — lihat `page-view.ts`. */

/**
 * Pola bot/crawler/preview yang umum. Sengaja tidak memakai kata "browser"
 * atau "mobile" agar browser sungguhan tidak ikut tersaring.
 */
const BOT_USER_AGENT =
  /(?:bot\b|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|pinterest|vkshare|whatsapp|telegrambot|discordbot|slackbot|linkedinbot|twitterbot|curl\/|wget\/|python-requests|python-urllib|aiohttp|httpx\/|axios\/|node-fetch|go-http-client|okhttp|java\/|headlesschrome|lighthouse|pagespeed|gtmetrix|pingdom|uptime|statuscake|vercel-screenshot|google-inspectiontool|adsbot|mediapartners-google|feedfetcher|validator)/i;

/** Path yang tidak pernah dianggap halaman publik. */
const EXCLUDED_EXACT = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);
const EXCLUDED_PREFIXES = ["/admin", "/api", "/_next", "/img"];

/** Route metadata Next.js (gambar OG/ikon) bukan halaman yang dibaca orang. */
const METADATA_IMAGE = /\/(?:opengraph-image|twitter-image|icon|apple-icon)$/;

/**
 * Path publik yang boleh dicatat, sudah dinormalisasi; null bila tidak layak.
 * Query string dibuang — yang dihitung adalah halaman, bukan parameter kampanye.
 */
export function trackablePath(pathname: string): string | null {
  if (!pathname.startsWith("/")) return null;

  let path = pathname;
  try {
    path = decodeURI(path);
  } catch {
    // Path rusak: pakai apa adanya, selama masih lolos aturan di bawah.
  }

  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 512) return null;
  if (path !== "/" && path.endsWith("/")) path = path.replace(/\/+$/, "");
  if (path.includes("\0")) return null;

  if (EXCLUDED_EXACT.has(path)) return null;
  for (const prefix of EXCLUDED_PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return null;
  }
  if (METADATA_IMAGE.test(path)) return null;
  // Berkas statis (mis. /fonts/x.woff2); route halaman tidak berakhiran ekstensi.
  if (/\.[a-z0-9]{1,8}$/i.test(path)) return null;

  return path;
}

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENT.test(userAgent);
}