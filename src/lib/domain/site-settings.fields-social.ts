/** Field skema Kontak & Umum: sosial, maps embed, GA4. */
import { z } from "zod";

import { isBlank } from "./text.ts";
import { parseMapsEmbedInput } from "./site-settings.maps.ts";
import { normalizeGa4Id } from "./site-settings.normalize.ts";
import { optionalPlatformUrl } from "./site-settings.schema-helpers.ts";
import { normalizeInstagramUsername } from "./site-settings.social.ts";

export const socialFields = {
  instagramUrl: optionalPlatformUrl("instagram", "Instagram"),
  instagramUsername: z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || normalizeInstagramUsername(value) !== null,
      "Username Instagram tidak valid. Tulis tanpa @, hanya huruf, angka, titik, dan garis bawah (maks. 30).",
    )
    .transform((value) => (isBlank(value) ? "" : (normalizeInstagramUsername(value) as string))),
  tiktokUrl: optionalPlatformUrl("tiktok", "TikTok"),
  facebookUrl: optionalPlatformUrl("facebook", "Facebook"),
  freshaUrl: optionalPlatformUrl("fresha", "Fresha"),
  mapsEmbedUrl: z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || parseMapsEmbedInput(value) !== null,
      "URL embed Google Maps harus diawali https://www.google.com/maps/embed? — atau tempel kode <iframe> dari Google Maps.",
    )
    .transform((value) => (isBlank(value) ? "" : (parseMapsEmbedInput(value) as string))),
  ga4MeasurementId: z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || normalizeGa4Id(value) !== null,
      "Measurement ID GA4 harus berformat G-XXXXXXXXXX.",
    )
    .transform((value) => (isBlank(value) ? "" : (normalizeGa4Id(value) as string))),
};