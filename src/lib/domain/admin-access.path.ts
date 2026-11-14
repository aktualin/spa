/** Normalisasi & path bersama admin — lihat `admin-access.ts`. */

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

/** true bila path boleh dibuka semua role yang sudah login. */
export function isSharedAdminPath(pathname: string): boolean {
  const path = normalizeAdminPath(pathname);
  if ((SHARED_EXACT_PATHS as readonly string[]).includes(path)) return true;
  return SHARED_PREFIXES.some((prefix) => isUnderPath(path, prefix));
}