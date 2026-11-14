/** Header cache bersama endpoint konten publik — sama untuk semua modul. */
export const CONTENT_CACHE = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;