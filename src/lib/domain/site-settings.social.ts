/** URL & username media sosial — lihat `site-settings.ts`. */

export const PLATFORM_HOSTS = {
  instagram: ["instagram.com", "instagr.am"],
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com", "fb.com", "fb.me"],
  fresha: ["fresha.com"],
} as const;

export type SocialPlatform = keyof typeof PLATFORM_HOSTS;

/** true bila `input` URL `https://` lengkap (host memuat titik). */
export function isHttpsUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** true bila URL `https://` dan domainnya milik platform tersebut. */
export function isPlatformUrl(input: string, platform: SocialPlatform): boolean {
  if (!isHttpsUrl(input)) return false;
  const host = new URL(input.trim()).hostname.toLowerCase();
  return PLATFORM_HOSTS[platform].some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

const INSTAGRAM_USERNAME = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-z0-9._]{1,30}$/;

/**
 * Normalisasi username Instagram: buang `@` di depan, huruf kecil.
 * Mengembalikan `null` bila tidak sesuai pola username Instagram
 * (huruf, angka, titik, garis bawah; maks. 30 karakter; titik tidak di awal,
 * akhir, atau berurutan).
 */
export function normalizeInstagramUsername(input: string): string | null {
  const value = input.trim().replace(/^@+/, "").toLowerCase();
  if (!value || !INSTAGRAM_USERNAME.test(value)) return null;
  return value;
}

/** `https://www.instagram.com/kama__spa/` → `kama__spa` (atau `null`). */
export function instagramUsernameFromUrl(input: string): string | null {
  if (!isPlatformUrl(input, "instagram")) return null;
  const segment = new URL(input.trim()).pathname.split("/").filter(Boolean)[0];
  return segment ? normalizeInstagramUsername(segment) : null;
}