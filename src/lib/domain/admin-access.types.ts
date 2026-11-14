/** Tipe matriks akses admin — lihat `admin-access.ts`. */
import { CONTENT_ROLES, type AdminRoleName } from "./roles.ts";

export type AccessChild = {
  label: string;
  href: string;
  /** Kosong = ikut role modul induknya. Harus bagian dari role induk. */
  roles?: readonly AdminRoleName[];
};

export type AccessModule = {
  label: string;
  href: string;
  roles: readonly AdminRoleName[];
  children?: readonly AccessChild[];
};

export type AccessRule = {
  /** Awalan path yang dijaga aturan ini. */
  href: string;
  roles: readonly AdminRoleName[];
  /** Nama modul (beserta sub-menu bila aturan berasal dari sub-menu). */
  label: string;
};

/** Semua role yang dikenal sistem. */
export const ALL_ADMIN_ROLES: readonly AdminRoleName[] = CONTENT_ROLES;