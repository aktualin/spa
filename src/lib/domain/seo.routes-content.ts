/** Route tetap: our story, journal, galeri, event, retail, gift card, kontak. */
import type { PublicStaticRoute } from "./seo.routes.ts";

export const SEO_ROUTES_CONTENT: readonly PublicStaticRoute[] = [
  {
    path: "/our-story",
    label: "Our Story",
    priority: 0.6,
    changeFrequency: "monthly",
    group: "story",
    contentEditor: { label: "Modul Our Story", href: "/admin/our-story" },
    contentModules: [{ label: "Our Story", href: "/admin/our-story" }],
  },
  {
    path: "/our-story/journal",
    label: "Journal",
    priority: 0.6,
    changeFrequency: "weekly",
    group: "journal",
    contentModules: [
      { label: "Journal", href: "/admin/journal" },
      { label: "Kategori", href: "/admin/journal/categories" },
    ],
  },
  {
    path: "/gallery",
    label: "Gallery",
    priority: 0.6,
    changeFrequency: "monthly",
    group: "gallery",
    contentModules: [{ label: "Foto & Gallery", href: "/admin/gallery" }],
  },
  {
    path: "/events",
    label: "Events",
    priority: 0.6,
    changeFrequency: "weekly",
    group: "events",
    contentModules: [{ label: "Events", href: "/admin/events" }],
  },
  {
    path: "/events/collaborations",
    label: "Kolaborasi",
    priority: 0.5,
    changeFrequency: "monthly",
    group: "events",
    contentModules: [{ label: "Events", href: "/admin/events" }],
  },
  {
    path: "/retail",
    label: "KAMA Retail",
    priority: 0.5,
    changeFrequency: "monthly",
    group: "retail",
    contentModules: [{ label: "KAMA Retail", href: "/admin/retail" }],
  },
  {
    path: "/gift-card",
    label: "Gift Card",
    priority: 0.5,
    changeFrequency: "monthly",
    group: "giftCard",
    contentModules: [{ label: "Gift Card", href: "/admin/gift-card" }],
  },
  {
    path: "/contact",
    label: "Contact",
    priority: 0.7,
    changeFrequency: "monthly",
    group: "contact",
    contentModules: [
      { label: "Cabang", href: "/admin/branches" },
      { label: "Kontak & Umum", href: "/admin/settings/contact" },
    ],
  },
];