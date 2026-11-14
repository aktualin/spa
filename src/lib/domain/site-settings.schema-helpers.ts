/** Pembangun field zod opsional untuk form Kontak & Umum. */
import { z } from "zod";

import { isSafeCtaHref, isSafeImageUrl } from "./homepage-banner.ts";
import { isBlank } from "./text.ts";
import {
  PLATFORM_HOSTS,
  isHttpsUrl,
  isPlatformUrl,
  type SocialPlatform,
} from "./site-settings.social.ts";

export function optionalImageUrl(label: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || isSafeImageUrl(value),
      `${label}: harus URL gambar https:// atau path internal.`,
    );
}

export function optionalCtaHref(label: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || isSafeCtaHref(value),
      `${label}: harus path internal (/membership), anchor (#booking), atau URL https://.`,
    );
}

export function optionalPlatformUrl(platform: SocialPlatform, label: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => isBlank(value) || isHttpsUrl(value),
      `${label}: isi alamat lengkap yang diawali https://`,
    )
    .refine(
      (value) => isBlank(value) || isPlatformUrl(value, platform),
      `${label}: alamat harus dari domain ${PLATFORM_HOSTS[platform][0]}.`,
    );
}