/** Aturan akses per path admin — lihat `admin-access.ts`. */
import { isSharedAdminPath, isUnderPath, normalizeAdminPath } from "./admin-access.path.ts";
import {
  ALL_ADMIN_ROLES,
  type AccessModule,
  type AccessRule,
} from "./admin-access.types.ts";
import { ADMIN_ONLY_ROLES, type AdminRoleName } from "./roles.ts";

/** Meratakan modul + sub-menu menjadi daftar aturan akses. */
export function accessRules(modules: readonly AccessModule[]): AccessRule[] {
  const rules: AccessRule[] = [];
  for (const m of modules) {
    rules.push({ href: normalizeAdminPath(m.href), roles: m.roles, label: m.label });
    for (const child of m.children ?? []) {
      rules.push({
        href: normalizeAdminPath(child.href),
        roles: child.roles ?? m.roles,
        label: `${m.label} — ${child.label}`,
      });
    }
  }
  return rules;
}

/**
 * Aturan yang paling spesifik (awalan terpanjang) untuk sebuah path admin,
 * atau null bila path tidak termasuk modul mana pun.
 */
export function findAccessRule(
  modules: readonly AccessModule[],
  pathname: string,
): AccessRule | null {
  const path = normalizeAdminPath(pathname);
  let best: AccessRule | null = null;
  for (const rule of accessRules(modules)) {
    if (!isUnderPath(path, rule.href)) continue;
    if (!best || rule.href.length > best.href.length) best = rule;
  }
  return best;
}

/**
 * Role yang boleh membuka path admin. Path admin yang tidak terdaftar di
 * matriks dianggap khusus ADMIN (fail-closed), supaya halaman baru yang lupa
 * didaftarkan tidak otomatis terbuka untuk EDITOR.
 */
export function rolesForAdminPath(
  modules: readonly AccessModule[],
  pathname: string,
): readonly AdminRoleName[] {
  if (isSharedAdminPath(pathname)) return ALL_ADMIN_ROLES;
  return findAccessRule(modules, pathname)?.roles ?? ADMIN_ONLY_ROLES;
}

export function canAccessAdminPath(
  modules: readonly AccessModule[],
  role: AdminRoleName,
  pathname: string,
): boolean {
  return rolesForAdminPath(modules, pathname).includes(role);
}

/**
 * Modul (dan sub-menunya) yang boleh tampil untuk sebuah role — dipakai
 * sidebar dan dashboard.
 */
export function visibleModules<M extends AccessModule>(
  modules: readonly M[],
  role: AdminRoleName,
): M[] {
  return modules
    .filter((m) => m.roles.includes(role))
    .map((m) =>
      m.children
        ? {
            ...m,
            children: m.children.filter((c) => (c.roles ?? m.roles).includes(role)),
          }
        : m,
    );
}

/**
 * Href modul/sub-menu yang paling cocok dengan path saat ini (awalan
 * terpanjang), atau null bila path bukan bagian dari modul mana pun. Dipakai
 * sidebar untuk menandai halaman aktif: `/admin/treatments/prices` menandai
 * modul "Harga", bukan "Treatments & Packages" yang awalannya lebih pendek.
 */
export function activeAdminHref(
  modules: readonly AccessModule[],
  pathname: string,
): string | null {
  return findAccessRule(modules, pathname)?.href ?? null;
}