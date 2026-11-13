import { asset } from "@/lib/asset-url";

/**
 * KAMA Spa logo.
 *
 * Mark aslinya (loop ganda diapit huruf KA–MA) dipakai dari aset PNG
 * tembus pandang di bucket S3 (`img/kama/mark-kama-*.png`, lihat `asset()`)
 * dalam dua varian warna.
 * Untuk ukuran kecil seperti navbar, mark dipasangkan dengan wordmark
 * teks memakai face display + label situs agar tetap terbaca; lockup
 * penuh (`logo-kama-*.png`) dipakai di momen brand yang besar (hero,
 * footer, panel login).
 */
export function Logo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const mark =
    variant === "light"
      ? asset("img/kama/mark-kama-light.png")
      : asset("img/kama/mark-kama-dark.png");

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${
        variant === "light" ? "text-cream-soft" : "text-cocoa"
      } ${className}`}
    >
      <img src={mark} alt="" aria-hidden="true" className="h-[26px] w-auto" />
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-[1.375rem] leading-none tracking-[0.06em]">
          KAMA
        </span>
        <span className="text-[0.5625rem] font-medium leading-none tracking-[0.28em]">
          SPA
        </span>
      </span>
    </span>
  );
}
