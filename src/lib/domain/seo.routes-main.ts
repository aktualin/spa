/** Route tetap: beranda, katalog, promo, membership, corporate. */
import type { PublicStaticRoute } from "./seo.routes.ts";

export const SEO_ROUTES_MAIN: readonly PublicStaticRoute[] = [
  {
    path: "/",
    label: "Beranda",
    priority: 1,
    changeFrequency: "weekly",
    group: "home",
    contentModules: [
      { label: "Homepage & Our Story", href: "/admin/homepage" },
      { label: "Teks Halaman", href: "/admin/page-copy" },
    ],
  },
  {
    path: "/treatments",
    label: "Treatments",
    priority: 0.9,
    changeFrequency: "monthly",
    group: "catalog",
    contentModules: [
      { label: "Treatments & Packages", href: "/admin/treatments" },
      { label: "Kategori", href: "/admin/treatments/categories" },
    ],
  },
  {
    path: "/treatments/packages",
    label: "Packages",
    priority: 0.8,
    changeFrequency: "monthly",
    group: "catalog",
    contentModules: [{ label: "Packages", href: "/admin/treatments/packages" }],
  },
  {
    path: "/menu",
    label: "Menu",
    priority: 0.8,
    changeFrequency: "monthly",
    group: "catalog",
    contentModules: [
      { label: "Treatments & Packages", href: "/admin/treatments" },
      { label: "Harga", href: "/admin/treatments/prices" },
    ],
  },
  {
    path: "/promos",
    label: "Promos",
    priority: 0.8,
    changeFrequency: "weekly",
    group: "promos",
    contentModules: [{ label: "Promos & Gift Card", href: "/admin/promos" }],
  },
  {
    path: "/membership",
    label: "Membership",
    priority: 0.7,
    changeFrequency: "monthly",
    group: "membership",
    contentModules: [{ label: "Membership", href: "/admin/membership" }],
  },
  {
    path: "/promos/membership",
    label: "Promo Membership",
    priority: 0.7,
    changeFrequency: "monthly",
    group: "membership",
    contentModules: [{ label: "Membership", href: "/admin/membership" }],
  },
  {
    path: "/corporate",
    label: "Corporate Wellness",
    priority: 0.7,
    changeFrequency: "monthly",
    group: "corporate",
    contentModules: [{ label: "Konten halaman", href: "/admin/corporate/content" }],
  },
];