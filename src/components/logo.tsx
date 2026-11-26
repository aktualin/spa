/**
 * Identitas brand dari Kontak & Umum (`SiteSettings`); kolom kosong jatuh ke
 * aset/teks bawaan. Dibaca di server (Navigation) lalu diteruskan sebagai
 * props supaya komponen ini tetap bisa dipakai di client.
 */
export type LogoBrand = {
  markLightUrl?: string;
  markDarkUrl?: string;
  wordmarkTop?: string;
  wordmarkBottom?: string;
  alt?: string;
};

/**
 * KAMA Spa logo navbar: lockup penuh `public/logo-kama-light.png`, tanpa
 * wordmark teks. File PNG-nya berwarna cream (varian untuk latar gelap),
 * sedangkan navbar cream — jadi dipakai sebagai mask CSS dan diwarnai
 * cocoa (`.kama-logo-lockup` di kama.css) agar terbaca.
 */
export function Logo({
  className = "",
  brand,
}: {
  className?: string;
  brand?: LogoBrand;
}) {
  const alt = brand?.alt || "KAMA Spa";

  return (
    <span
      role="img"
      aria-label={alt}
      className={`kama-logo-lockup inline-block h-8 xl:h-9 ${className}`}
    />
  );
}