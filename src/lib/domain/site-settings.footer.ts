/** Penerapan pengaturan ke tampilan publik — lihat `site-settings.ts`. */
import type { SiteSettings } from "./site-settings.types.ts";

/** Cabang utama yang alamat & petanya diatur lewat Kontak & Umum. */
export const FLAGSHIP_LOCATION_SLUG = "south-jakarta";

export type FooterSocial = {
  label: "Instagram" | "TikTok" | "Facebook" | "Email";
  href: string;
  icon: "instagram" | "tiktok" | "facebook" | "email";
};

/**
 * Ikon "Connect with us" di footer: Instagram, TikTok, Facebook, Email —
 * yang kosong tidak ditampilkan. Urutan & label sama dengan desain lama.
 */
export function footerSocials(settings: SiteSettings): FooterSocial[] {
  const items: FooterSocial[] = [];
  if (settings.instagramUrl) {
    items.push({ label: "Instagram", href: settings.instagramUrl, icon: "instagram" });
  }
  if (settings.tiktokUrl) {
    items.push({ label: "TikTok", href: settings.tiktokUrl, icon: "tiktok" });
  }
  if (settings.facebookUrl) {
    items.push({ label: "Facebook", href: settings.facebookUrl, icon: "facebook" });
  }
  if (settings.email) {
    items.push({ label: "Email", href: `mailto:${settings.email}`, icon: "email" });
  }
  return items;
}