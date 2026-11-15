import { updateTag } from "next/cache";

import { CONTENT_TAGS } from "@/lib/content/tags";

/**
 * Segarkan peta redirect 301 publik (`src/lib/redirects.map.ts`) setelah slug
 * katalog/journal/events berubah. Dipanggil action modul lain; tidak ada UI
 * admin untuk redirect — barisnya dikelola langsung di database.
 */
export function revalidateRedirects() {
  updateTag(CONTENT_TAGS.redirects);
}
