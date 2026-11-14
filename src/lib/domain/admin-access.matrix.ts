/** Pemeriksaan konsistensi matriks akses — lihat `admin-access.ts`. */
import { isSharedAdminPath, isUnderPath, normalizeAdminPath } from "./admin-access.path.ts";
import type { AccessModule } from "./admin-access.types.ts";

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