/**
 * Pembatasan akses dashboard admin per role — logika murni (tanpa Next.js
 * maupun Prisma) supaya bisa diuji unit.
 *
 * Datanya, yaitu matriks role → modul, TIDAK ditulis di sini: sumber tunggalnya
 * `ADMIN_MODULES` di src/app/admin/modules.ts. Berkas ini hanya menyediakan
 * aturan pencocokan path admin dengan matriks tersebut, dipakai untuk sidebar,
 * dashboard, dan guard halaman.
 */

import {
  ADMIN_ONLY_ROLES,
  CONTENT_ROLES,
  type AdminRoleName,
} from "./roles.ts";

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

/**
 * Path yang boleh dibuka semua role yang sudah login, di luar matriks modul:
 * dashboard (persis `/admin`) dan halaman akun sendiri (ganti kata sandi).
 * Login/logout dijaga proxy, bukan oleh aturan ini.
 */
const SHARED_EXACT_PATHS = ["/admin"] as const;
const SHARED_PREFIXES = ["/admin/account", "/admin/login", "/admin/logout"] as const;

/** Membuang query/hash dan garis miring di akhir: "/admin/users/?a=1" → "/admin/users". */
export function normalizeAdminPath(input: string): string {
  let path = input.split(/[?#]/, 1)[0] ?? "";
  if (!path.startsWith("/")) path = `/${path}`;
  while (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

/** true bila `path` sama dengan `prefix` atau berada di bawahnya (per segmen). */
export function isUnderPath(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

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

/** true bila path boleh dibuka semua role yang sudah login. */
export function isSharedAdminPath(pathname: string): boolean {
  const path = normalizeAdminPath(pathname);
  if ((SHARED_EXACT_PATHS as readonly string[]).includes(path)) return true;
  return SHARED_PREFIXES.some((prefix) => isUnderPath(path, prefix));
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
 * Pemeriksaan konsistensi matriks: nomor modul & href unik, role sub-menu
 * bagian dari role induk, dan semua href berada di bawah /admin.
 * Mengembalikan daftar masalah (kosong = sehat).
 */
export function validateAccessMatrix(
  modules: readonly (AccessModule & { no: number })[],
): string[] {
  const problems: string[] = [];
  const numbers = new Set<number>();
  const hrefs = new Set<string>();

  for (const m of modules) {
    if (numbers.has(m.no)) problems.push(`Nomor modul ${m.no} dipakai lebih dari sekali.`);
    numbers.add(m.no);

    if (m.roles.length === 0) problems.push(`Modul "${m.label}" tidak punya role.`);

    const entries: { href: string; label: string }[] = [
      { href: m.href, label: m.label },
      ...(m.children ?? []).map((c) => ({ href: c.href, label: `${m.label} — ${c.label}` })),
    ];
    for (const entry of entries) {
      const href = normalizeAdminPath(entry.href);
      if (!isUnderPath(href, "/admin") || href === "/admin") {
        problems.push(`"${entry.label}" harus berada di bawah /admin/.`);
      }
      if (isSharedAdminPath(href)) {
        problems.push(`"${entry.label}" bentrok dengan path bersama ${href}.`);
      }
      if (hrefs.has(href)) problems.push(`Href ${href} terdaftar lebih dari sekali.`);
      hrefs.add(href);
    }

    for (const child of m.children ?? []) {
      const extra = (child.roles ?? []).filter((r) => !m.roles.includes(r));
      if (extra.length > 0) {
        problems.push(
          `Sub-menu "${child.label}" memberi role ${extra.join(", ")} yang tidak dimiliki modul "${m.label}".`,
        );
      }
    }
  }

  return problems;
}
