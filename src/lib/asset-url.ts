/**
 * URL publik aset statis (gambar, logo) di bucket S3 (Supabase Storage).
 *
 * Seluruh gambar situs — termasuk logo — dilayani dari bucket, bukan dari
 * `public/`. Key objek sama dengan path relatifnya, mis. `img/kama/logo.png`
 * (lihat `scripts/migrate-static-assets-to-s3.mts`).
 *
 * `NEXT_PUBLIC_ASSET_BASE_URL` di-inline saat build oleh `next.config.ts`
 * (diturunkan dari NEXT_PUBLIC_SUPABASE_PUBLIC_URL + SUPABASE_S3_BUCKET),
 * jadi helper ini juga aman dipakai di client component.
 */
function baseUrl(): string {
  // Dibaca per panggilan (bukan saat import) supaya skrip seed yang memuat
  // .env setelah import tetap mendapat nilainya. Di luar Next (skrip node),
  // base diturunkan langsung dari konfigurasi storage.
  const explicit = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL;
  const bucket = process.env.SUPABASE_S3_BUCKET;
  return publicUrl && bucket ? `${publicUrl.replace(/\/$/, "")}/${bucket}` : "";
}

/** `asset("img/kama/01-incense.jpg")` → `https://…/public/<bucket>/img/kama/01-incense.jpg`. */
export function asset(key: string): string {
  const clean = key.replace(/^\/+/, "");
  // Tanpa konfigurasi storage (mis. checkout baru tanpa .env), jatuh ke path lokal.
  const base = baseUrl();
  return base ? `${base}/${clean}` : `/${clean}`;
}
