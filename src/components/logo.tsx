import { asset } from "@/lib/asset-url";

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
 * KAMA Spa logo.
 *
 * Mark aslinya (loop ganda diapit huruf KA–MA) dipakai dari aset PNG
 * tembus pandang di bucket S3 (`img/kama/mark-kama-*.png`, lihat `asset()`)
 * dalam dua varian warna — atau URL yang diatur admin.
 * Untuk ukuran kecil seperti navbar, mark dipasangkan dengan wordmark
 * teks memakai face display + label situs agar tetap terbaca; lockup
 * penuh (`logo-kama-*.png`) dipakai di momen brand yang besar (hero,
 * footer, panel login).
 */
export function Logo({
  className = "",
  variant = "dark",
  brand,
}: {
  className?: string;
  variant?: "dark" | "light";
  brand?: LogoBrand;
}) {
  const mark =
    variant === "light"
      ? brand?.markLightUrl || asset("img/kama/mark-kama-light.png")
      : brand?.markDarkUrl || asset("img/kama/mark-kama-dark.png");
  const wordmarkTop = brand?.wordmarkTop || "KAMA";
  const wordmarkBottom = brand?.wordmarkBottom || "SPA";
  const alt = brand?.alt || "KAMA Spa";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${
        variant === "light" ? "text-cream-soft" : "text-cocoa"
      } ${className}`}
    >
      <img src={mark} alt={alt} className="h-[26px] w-auto" />
      <span className="flex items-baseline gap-1.5" aria-hidden="true">
        <span className="font-display text-[1.375rem] leading-none tracking-[0.06em]">
          {wordmarkTop}
        </span>
        <span className="text-[0.5625rem] font-medium leading-none tracking-[0.28em]">
          {wordmarkBottom}
        </span>
      </span>
    </span>
  );
}