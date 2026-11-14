/**
 * Pembatasan akses dashboard admin per role — logika murni (tanpa Next.js
 * maupun Prisma) supaya bisa diuji unit.
 *
 * Datanya, yaitu matriks role → modul, TIDAK ditulis di sini: sumber tunggalnya
 * `ADMIN_MODULES` di src/app/admin/modules.ts. Berkas ini hanya menyediakan
 * aturan pencocokan path admin dengan matriks tersebut, dipakai untuk sidebar,
 * dashboard, dan guard halaman.
 *
 * Implementasinya dipecah ke berkas `admin-access.*.ts` di folder ini; berkas
 * ini hanya mengekspor ulang simbol publiknya.
 */

export {
  type AccessChild,
  type AccessModule,
  type AccessRule,
  ALL_ADMIN_ROLES,
} from "./admin-access.types.ts";
export {
  normalizeAdminPath,
  isUnderPath,
  isSharedAdminPath,
} from "./admin-access.path.ts";
export {
  accessRules,
  findAccessRule,
  rolesForAdminPath,
  canAccessAdminPath,
  visibleModules,
  activeAdminHref,
} from "./admin-access.rules.ts";
export { validateAccessMatrix } from "./admin-access.matrix.ts";
export {
  type AccessGroup,
  type GroupedModules,
  groupModules,
} from "./admin-access.groups.ts";