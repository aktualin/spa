import { readImageUrl } from "@/lib/domain/corporate";
import { stripTags } from "@/lib/domain/sanitize";

import { formStr } from "./form-utils";

export type ActionState = { error: string | null; ok?: boolean };

/** Foto section hero/about/in-spa beserta alt-nya (nilai form admin). */
export type CorporateImageValues = {
  heroImageUrl: string;
  heroImageAlt: string;
  aboutImageUrl: string;
  aboutImageAlt: string;
  inSpaImageUrl: string;
  inSpaImageAlt: string;
};

const IMAGE_ALT_MAX = 160;

/** Satu pasang gambar + alt: URL wajib https (Media Library), alt opsional. */
export function readImagePair(formData: FormData, key: "hero" | "about" | "inSpa") {
  const image = readImageUrl(formStr(formData, `${key}ImageUrl`));
  if (!image.ok) return image;
  const alt = stripTags(formStr(formData, `${key}ImageAlt`)).trim();
  if (alt.length > IMAGE_ALT_MAX) {
    return { ok: false as const, error: `Alt gambar ${key} maksimal ${IMAGE_ALT_MAX} karakter.` };
  }
  return { ok: true as const, data: { url: image.data, alt: alt || null } };
}