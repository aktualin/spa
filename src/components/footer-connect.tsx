import type { FooterSocial } from "@/lib/domain/site-settings";
import { Email, Facebook, Instagram, TikTok, WhatsApp } from "./icons";

/* One icon per social platform — never a generic link glyph. */
const socialIcons = {
  instagram: Instagram,
  tiktok: TikTok,
  facebook: Facebook,
  email: Email,
} as const;

/** Link WhatsApp kantor: `href` wa.me + `display` nomor lokal (0811 8807 2287). */
export type OfficeWhatsApp = { href: string; display: string };

/**
 * Baris "Connect With Us" di footer: ikon sosial (field kosong sudah disaring
 * `footerSocials`) + WhatsApp kantor dengan nomor tampil. Terpisah dari WA
 * booking (tombol melayang). `officeWhatsApp` null → baris kantor tidak dirender.
 */
export function FooterConnect({
  socials,
  officeWhatsApp,
}: {
  socials: FooterSocial[];
  officeWhatsApp: OfficeWhatsApp | null;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {socials.map((social) => {
          const Icon = socialIcons[social.icon];
          return (
            <a
              key={social.label}
              href={social.href}
              target={social.icon === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-soft/40 transition-colors hover:bg-cream-soft hover:text-cocoa"
            >
              <Icon className="h-5 w-5" />
            </a>
          );
        })}
      </div>
      {/* Nomor kantor tampil sebagai teks; seluruh pil clickable ke wa.me.
          Accessible name = sr-only + teks tampak (label-in-name, WCAG 2.5.3),
          bukan aria-label yang akan menyembunyikan nomor dari voice control. */}
      {officeWhatsApp ? (
        <a
          href={officeWhatsApp.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-full border border-cream-soft/40 py-1 pr-4 transition-colors hover:bg-cream-soft hover:text-cocoa"
        >
          <span className="flex h-9 w-9 items-center justify-center">
            <WhatsApp className="h-5 w-5" />
          </span>
          <span className="text-caption">
            <span className="sr-only">Office WhatsApp: </span>
            {officeWhatsApp.display}
          </span>
        </a>
      ) : null}
    </div>
  );
}
