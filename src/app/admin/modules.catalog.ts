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
  // Modul kontrak no. 5 (Membership) dan no. 8 (KAMA Retail) sengaja tidak
  // didaftarkan: menu dihapus dari sidebar per 27 Nov 2026. Halamannya masih
  // ada dan fail-closed khusus ADMIN (lihat modules.ts).
];