import { ADMIN_ONLY_ROLES, CONTENT_ROLES } from "../../lib/domain/roles.ts";

import type { AdminModule } from "./modules.types.ts";

/** Modul kelompok "Analitik" dan "Pengaturan Sistem". */
export const SYSTEM_MODULES: readonly AdminModule[] = [
  {
    // Modul tambahan di luar 14 modul Lampiran I; nomor 20 hanya penanda unik.
    no: 20,
    label: "Visitors & Pages",
    href: "/admin/analytics",
    group: "analitik",
    hint: "Unique visitors, page views, and the most visited public pages.",
    roles: CONTENT_ROLES,
    ready: true,
  },
  {
    no: 12,
    label: "Contact & General",
    href: "/admin/settings/contact",
    group: "sistem",
    hint: "WhatsApp number, email, booking link, social icons, GA4, and favicon — used across the whole site.",
    roles: ADMIN_ONLY_ROLES,
    ready: true,
    children: [{ label: "Template WhatsApp", href: "/admin/settings/whatsapp" }],
  },
  {
    no: 14,
    label: "Admin Users",
    href: "/admin/users",
    group: "sistem",
    hint: "Accounts and roles that can log in to this dashboard. Not shown on the public site.",
    roles: ADMIN_ONLY_ROLES,
    ready: true,
  },
  // {
  //   // Modul tambahan di luar 14 modul Lampiran I; nomor 19 mengikuti
  //   // penanda "Modul 19" di prisma/schema.prisma (BackupRun).
  //   no: 19,
  //   label: "Backup & Status",
  //   href: "/admin/status",
  //   group: "sistem",
  //   hint: "Database copies and system status. Not shown on the public site.",
  //   roles: ADMIN_ONLY_ROLES,
  //   ready: true,
  // },
];