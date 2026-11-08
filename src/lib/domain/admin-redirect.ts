export const ADMIN_HOME = "/admin";
export const CHANGE_PASSWORD_PATH = "/admin/account/password";

/**
 * Tujuan setelah login. Hanya path admin internal yang diterima, supaya
 * `?next=` tidak bisa dipakai sebagai open redirect atau memantul ke halaman login.
 */
export function safeAdminNext(next: string | null | undefined): string {
  if (!next) return ADMIN_HOME;
  if (next !== ADMIN_HOME && !next.startsWith(`${ADMIN_HOME}/`)) return ADMIN_HOME;
  // `\` dinormalisasi browser menjadi `/`, dan `//` bisa dibaca sebagai host lain.
  if (next.includes("\\") || next.includes("//")) return ADMIN_HOME;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(next)) return ADMIN_HOME;
  if (next === "/admin/login" || next.startsWith("/admin/login?")) return ADMIN_HOME;
  if (next.startsWith("/admin/logout")) return ADMIN_HOME;
  return next;
}
