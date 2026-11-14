import { CONTENT_ROLES } from "../../lib/domain/roles.ts";

import type { AdminModule } from "./modules.types.ts";

/** Modul kelompok "Katalog & Harga". */
export const CATALOG_MODULES: readonly AdminModule[] = [
  {
    no: 1,
    label: "Treatments & Packages",
    href: "/admin/treatments",
    group: "katalog",
    hint: "Tampil di halaman Treatments, Menu, dan Signature Treatments di homepage.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Kategori", href: "/admin/treatments/categories" },
      { label: "Packages", href: "/admin/treatments/packages" },
      { label: "Add-on", href: "/admin/treatments/addons" },
    ],
  },
  {
    no: 2,
    label: "Harga",
    href: "/admin/treatments/prices",
    group: "katalog",
    hint: "Harga yang tampil di kartu treatment, paket, dan halaman Menu.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 5,
    label: "Membership",
    href: "/admin/membership",
    group: "katalog",
    hint: "Halaman Membership, banner membership di homepage, dan tautan di footer.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 8,
    label: "KAMA Retail",
    href: "/admin/retail",
    group: "katalog",
    hint: "Produk yang tampil di halaman KAMA Retail.",
    roles: CONTENT_ROLES,
    ready: true,
  },
];