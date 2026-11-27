import { CONTENT_ROLES } from "../../lib/domain/roles.ts";

import type { AdminModule } from "./modules.types.ts";

/** Modul kelompok "Katalog & Harga". */
export const CATALOG_MODULES: readonly AdminModule[] = [
  {
    no: 1,
    label: "Treatments & Packages",
    href: "/admin/treatments",
    group: "katalog",
    hint: "Shown on the Treatments and Menu pages, and Signature Treatments on the homepage.",
    roles: CONTENT_ROLES,
    ready: true,
    children: [
      { label: "Categories", href: "/admin/treatments/categories" },
      { label: "Packages", href: "/admin/treatments/packages" },
      { label: "Add-on", href: "/admin/treatments/addons" },
    ],
  },
  {
    no: 2,
    label: "Price",
    href: "/admin/treatments/prices",
    group: "katalog",
    hint: "Prices shown on treatment and package cards and the Menu page.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  // Modul kontrak no. 5 (Membership) dan no. 8 (KAMA Retail) sengaja tidak
  // didaftarkan: menu dihapus dari sidebar per 27 Nov 2026. Halamannya masih
  // ada dan fail-closed khusus ADMIN (lihat modules.ts).
];