/**
 * Aturan modul Cabang (`Branch`): batas isian admin, urutan tampil, dan
 * validasi form.
 *
 * Satu cabang menyimpan sendiri alamat, jam, dan kontaknya. Kolom yang
 * dibiarkan kosong diisi dari Kontak & Umum saat dibaca (lihat
 * `src/lib/content/branches.ts`) — keduanya sama-sama data admin, jadi itu
 * bukan konten statis.
 *
 * Modul murni (tanpa I/O) supaya bisa diuji langsung dengan `node --test`.
 * Implementasinya dipecah ke berkas `branch.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export { BRANCH_LIMITS } from "./branch.limits.ts";
export {
  type BranchOrderRow,
  compareBranches,
  sortBranches,
  planBranchMove,
  canMoveBranch,
  nextBranchSortOrder,
} from "./branch.order.ts";
export { type MapPoint, branchesCenter } from "./branch.map.ts";
export { branchInputSchema, type BranchParsed } from "./branch.schema.ts";