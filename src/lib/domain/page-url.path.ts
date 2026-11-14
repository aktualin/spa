/** Bentuk baku path untuk pencocokan redirect — lihat `page-url.ts`. */

/**
 * Bentuk baku path untuk pencocokan redirect: diawali satu `/`, tanpa garis
 * miring di akhir (kecuali root), tanpa query/hash, huruf kecil.
 */
export function normalizePath(input: string): string {
  let path = input.trim();
  const cut = path.search(/[?#]/);
  if (cut !== -1) path = path.slice(0, cut);
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path.toLowerCase();
}

const SYSTEM_PREFIXES = ["/admin", "/api", "/_next"];

export function isSystemPath(path: string): boolean {
  return SYSTEM_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}