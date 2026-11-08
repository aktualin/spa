/**
 * Tombol WhatsApp untuk halaman publik.
 *
 * Semua link `wa.me` dibangun lewat `@/lib/content/whatsapp` (nomor dari
 * pengaturan situs + template per konteks) — jangan menulis URL WhatsApp
 * langsung di halaman. Atribut `data-wa-context` menandai konteks tombol
 * untuk pelacakan klik (GA4) tanpa mengubah tampilan.
 */
import type { ReactNode } from "react";

import { whatsAppHref, type WhatsAppHrefOptions } from "@/lib/content/whatsapp";
import type { WhatsAppContextKey } from "@/lib/domain/whatsapp-template";

type WaButtonProps = WhatsAppHrefOptions & {
  /** Konteks template WhatsApp (treatment, package, promo, …). */
  context: WhatsAppContextKey;
  /** Label tombol. */
  label: string;
  /** Gaya tombol; default mengikuti `.button` gaya halaman lama. */
  className?: string;
};

/** Tombol WhatsApp bergaya `.button` lama; href dibaca di server. */
export async function WaButton({
  context,
  custom,
  values,
  label,
  className = "button is-secondary is-icon w-inline-block",
}: WaButtonProps) {
  const href = await whatsAppHref(context, { custom, values });
  // Nomor WhatsApp belum diatur admin → tombol disembunyikan, bukan tautan rusak.
  if (!href) return null;
  return (
    <WaLink href={href} context={context} className={className}>
      <div>{label}</div>
    </WaLink>
  );
}

/**
 * Anchor WhatsApp polos (target baru, `noopener`) dengan penanda konteks.
 * Markup-nya sama dengan `WhatsAppLink` di `page-parts` plus `data-wa-context`.
 * `href` kosong (nomor belum diatur admin) → tidak dirender.
 */
export function WaLink({
  href,
  context,
  className = "btn btn-primary",
  children,
  ...rest
}: {
  href: string | null;
  context: WhatsAppContextKey;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-wa-context={context}
      {...rest}
    >
      {children}
    </a>
  );
}
