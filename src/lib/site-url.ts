/**
 * Alamat kanonik situs — dipakai sitemap, robots, dan `metadataBase`.
 *
 * Di Vercel, preview deployment punya host berbeda tiap build; `VERCEL_URL`
 * dipakai supaya URL absolut di preview menunjuk ke preview itu sendiri, bukan
 * ke domain produksi. Produksi selalu memakai domain kontrak.
 */
const PRODUCTION_URL = "https://kamaspa.id";

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel && process.env.VERCEL_ENV !== "production") {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return PRODUCTION_URL;
}
