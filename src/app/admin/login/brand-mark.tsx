/**
 * Monogram KAMASPA untuk halaman masuk dashboard — SVG inline supaya tidak
 * menambah request dan ikut warna teks induknya (`currentColor`).
 *
 * Bentuknya huruf K geometris: satu batang tegak dan sepasang diagonal yang
 * bertemu di tengah. Sengaja tanpa detail halus agar tetap terbaca pada 36px
 * maupun saat dibesarkan jadi latar panel.
 */
export function BrandMark({
  className = "",
  title = "KAMASPA",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 6v28"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M29 6 13.5 20 29 34"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
