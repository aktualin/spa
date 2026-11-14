import type { ReactNode } from "react";

export type IconProps = { className?: string };

/**
 * Bingkai `<svg>` bersama semua ikon: ukuran 100%, `aria-hidden`, dan fill
 * bawaan `none` (ikon garis). Ikon filled (mis. WhatsAppBrand) mengisi
 * `fill="currentColor"` sendiri.
 */
export function IconFrame({
  viewBox,
  className,
  fill = "none",
  children,
}: IconProps & {
  viewBox: string;
  fill?: string;
  children: ReactNode;
}) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={viewBox}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}