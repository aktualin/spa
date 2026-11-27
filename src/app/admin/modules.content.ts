import { CONTENT_ROLES } from "../../lib/domain/roles.ts";

import type { AdminModule } from "./modules.types.ts";

/** Modul kelompok "Konten Situs". */
export const CONTENT_MODULES: readonly AdminModule[] = [
  {
    no: 10,
    label: "Homepage & Our Story",
    href: "/admin/homepage",
    group: "konten",
    hint: "Homepage section layout, hero, stats, Instagram feed, and the Our Story page.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Highlight", href: "/admin/homepage/highlights" },
      // { label: "Stats", href: "/admin/homepage/stats" },
      { label: "Feed Instagram", href: "/admin/homepage/instagram" },
      { label: "Our Story", href: "/admin/our-story" },
    ],
  },
  {
    no: 6,
    label: "Journal",
    href: "/admin/journal",
    group: "konten",
    hint: "Articles on the Journal page and the What's New cards on the homepage.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [{ label: "Categories", href: "/admin/journal/categories" }],
  },
  {
    no: 3,
    label: "Photo & Gallery",
    href: "/admin/gallery",
    group: "konten",
    hint: "The Gallery page and the Gallery Teaser section on the homepage.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 9,
    label: "Corporate Wellness",
    href: "/admin/corporate",
    group: "konten",
    hint: "The Corporate Wellness page with its form and the list of incoming inquiries.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Inquiries", href: "/admin/corporate/inquiries" },
      { label: "PIC", href: "/admin/corporate/pic" },
      { label: "Page content", href: "/admin/corporate/content" },
    ],
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 22 hanya penanda unik.
    no: 22,
    label: "Reservation",
    href: "/admin/reservations",
    group: "konten",
    hint: "Reservation requests from the public forms (/contact & /reservation) with their follow-up status.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 16 hanya penanda unik.
    no: 16,
    label: "Media Library",
    href: "/admin/media",
    group: "konten",
    hint: "Image library used by other modules via the “Select from Media Library” button.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  // Modul kontrak no. 4 (Promos & Gift Card, termasuk anak /admin/gift-card)
  // dan no. 7 (Events) sengaja tidak didaftarkan: menu dihapus dari sidebar
  // per 27 Nov 2026. Halamannya masih ada dan fail-closed khusus ADMIN
  // (lihat modules.ts).
];