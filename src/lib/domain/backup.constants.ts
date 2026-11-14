/** Konstanta modul Backup & Status — lihat `backup.ts`. */

/** Secret pencatatan backup otomatis minimal sepanjang ini; lebih pendek = dianggap belum diset. */
export const MIN_REPORT_SECRET_LENGTH = 32;

/** Batas ukuran body laporan dari GitHub Actions. */
export const REPORT_MAX_BODY_BYTES = 4096;

/** Backup otomatis mingguan dianggap terlambat bila sukses terakhir lebih lama dari ini. */
export const AUTO_BACKUP_STALE_DAYS = 8;

/** Sertifikat SSL dianggap "segera habis" bila sisa masa berlakunya kurang dari ini. */
export const CERT_EXPIRING_DAYS = 14;

/** Batas atas kolom `BackupRun.sizeBytes` (Postgres `integer`). */
export const MAX_SIZE_BYTES = 2_147_483_647;

export const LOCATION_MAX = 200;
export const NOTE_MAX = 500;
export const REPORT_NOTE_MAX = 300;
export const FORMAT_MAX = 80;

/** Format bawaan backup otomatis (lihat `.github/workflows/backup.yml`). */
export const AUTO_BACKUP_FORMAT = "pg_dump .sql.gz terenkripsi (GPG AES-256)";

/** Field yang tidak boleh keluar dari database lewat ekspor JSON. */
export const SENSITIVE_FIELDS: Readonly<Record<string, readonly string[]>> = {
  AdminUser: ["passwordHash"],
};

/** Model yang isinya data pribadi pengunjung (UU PDP) — ekspornya harus dipilih sadar. */
export const PERSONAL_DATA_MODELS: readonly string[] = ["CorporateInquiry"];