import type { AccessChild, AccessGroup } from "../../lib/domain/admin-access.ts";
import type { AdminRoleName } from "../../lib/domain/roles.ts";

export type AdminModule = {
  /** Nomor modul di Lampiran I Bagian D (15+ = modul tambahan). Harus unik. */
  no: number;
  label: string;
  href: string;
  /** Kelompok sidebar; id harus ada di `ADMIN_GROUPS`. */
  group: string;
  /**
   * Satu kalimat: konten modul ini tampil di mana pada situs publik. Dipakai
   * sidebar (tooltip), kartu dashboard, dan petunjuk di atas halaman modul.
   */
  hint: string;
  /** Role yang boleh membuka modul ini (sidebar + halaman + Server Action). */
  roles: readonly AdminRoleName[];
  /** false selama halamannya belum dibangun — sidebar menandainya "segera". */
  ready: boolean;
  /** Sub-halaman modul; `roles` kosong = ikut modul induk. */
  children?: AccessChild[];
};

export const ADMIN_GROUPS: readonly AccessGroup[] = [
  { id: "katalog", label: "Katalog & Harga" },
  { id: "konten", label: "Konten Situs" },
  { id: "struktur", label: "Halaman & Navigasi" },
  { id: "analitik", label: "Analitik" },
  { id: "sistem", label: "Pengaturan Sistem" },
];