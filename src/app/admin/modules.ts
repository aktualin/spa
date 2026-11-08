import type { AdminRoleName } from "@/lib/session";

/**
 * 14 modul dashboard sesuai Lampiran I Bagian D kontrak 01/PKS/XI/KAMA/2026.
 * Dipakai sebagai sumber tunggal untuk sidebar dan untuk melacak progres build.
 */
export type AdminModule = {
  /** Nomor modul di Lampiran I Bagian D. */
  no: number;
  label: string;
  href: string;
  /** Role yang boleh membuka modul ini. */
  roles: readonly AdminRoleName[];
  /** false selama halamannya belum dibangun — sidebar menandainya "segera". */
  ready: boolean;
  /** Sub-halaman modul yang ditampilkan di bawah item sidebar. */
  children?: { label: string; href: string }[];
};

export const ADMIN_MODULES: readonly AdminModule[] = [
  {
    no: 1,
    label: "Treatments & Packages",
    href: "/admin/treatments",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
    children: [
      { label: "Add-on", href: "/admin/treatments/addons" },
      { label: "Kategori", href: "/admin/treatments/categories" },
      { label: "Packages", href: "/admin/treatments/packages" },
    ],
  },
  {
    no: 2,
    label: "Harga",
    href: "/admin/treatments/prices",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
  },
  {
    no: 3,
    label: "Foto & Gallery",
    href: "/admin/gallery",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
  },
  {
    no: 4,
    label: "Promos & Gift Card",
    href: "/admin/promos",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
    children: [{ label: "Gift Card", href: "/admin/gift-card" }],
  },
  {
    no: 5,
    label: "Membership",
    href: "/admin/membership",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
  },
  {
    no: 6,
    label: "Journal",
    href: "/admin/journal",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
  },
  {
    no: 7,
    label: "Events",
    href: "/admin/events",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
  },
  {
    no: 8,
    label: "KAMA Retail",
    href: "/admin/retail",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
  },
  {
    no: 9,
    label: "Corporate Wellness",
    href: "/admin/corporate",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
    children: [{ label: "Inquiries", href: "/admin/corporate/inquiries" }],
  },
  {
    no: 10,
    label: "Homepage & Our Story",
    href: "/admin/homepage",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
    children: [{ label: "Our Story", href: "/admin/our-story" }],
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 15 hanya penanda unik.
    no: 15,
    label: "Halaman & URL",
    href: "/admin/pages",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
    children: [{ label: "Redirect 301", href: "/admin/redirects" }],
  },
  {
    no: 11,
    label: "Menu Navigasi",
    href: "/admin/menu",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
  },
  {
    no: 12,
    label: "Kontak & Umum",
    href: "/admin/settings/contact",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
    children: [{ label: "Template WhatsApp", href: "/admin/settings/whatsapp" }],
  },
  {
    no: 13,
    label: "SEO",
    href: "/admin/seo",
    roles: ["ADMIN", "EDITOR"],
    ready: true,
  },
  {
    no: 14,
    label: "Pengguna Admin",
    href: "/admin/users",
    roles: ["ADMIN"],
    ready: true,
  },
];

export function modulesForRole(role: AdminRoleName): readonly AdminModule[] {
  return ADMIN_MODULES.filter((m) => m.roles.includes(role));
}
