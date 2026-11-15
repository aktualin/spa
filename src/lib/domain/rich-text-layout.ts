/**
 * Class layout gambar untuk editor teks kaya admin (posisi gambar ala
 * Google Docs: teks mengalir di kiri/kanan gambar, atau gambar satu blok
 * di atas/bawah teks). Satu-satunya sumber kebenaran: sanitizer hanya
 * meloloskan class di daftar ini, dan CSS-nya ada di `.kama-prose`
 * (src/app/kama.css).
 */

/** Posisi gambar yang bisa dipilih dari toolbar editor. */
export type ImagePlacement = "left" | "right" | "center" | "block";

/** Class per posisi; "block" = tanpa class (gambar default selebar kolom). */
export const IMAGE_PLACEMENT_CLASSES: Record<Exclude<ImagePlacement, "block">, string> = {
  left: "kama-img-left",
  right: "kama-img-right",
  center: "kama-img-center",
};

/** Semua class layout yang dikenali sanitizer (daftar putih atribut class). */
export const LAYOUT_CLASSES: ReadonlySet<string> = new Set(Object.values(IMAGE_PLACEMENT_CLASSES));
