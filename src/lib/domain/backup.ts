/**
 * Logika murni modul 19 (Backup & Status) — tanpa Prisma, tanpa jaringan,
 * supaya bisa diuji langsung dengan `node --test`.
 *
 * Prinsip yang dijaga di seluruh modul:
 * - Isi backup TIDAK pernah disimpan di server maupun bucket storage (bucket
 *   `kamaspa.id` bersifat publik). Database hanya menyimpan catatan
 *   (`BackupRun`): jenis, status, ukuran, lokasi tanpa kredensial, checksum.
 * - Dump database memuat data pribadi (inquiry Corporate Wellness, UU PDP),
 *   jadi backup otomatis selalu dienkripsi sebelum keluar dari runner.
 * - `passwordHash` admin tidak pernah ikut ekspor JSON.
 *
 * Implementasinya dipecah ke berkas `backup.*.ts` di folder ini; berkas ini
 * hanya mengekspor ulang simbol publiknya.
 */

export {
  MIN_REPORT_SECRET_LENGTH,
  REPORT_MAX_BODY_BYTES,
  AUTO_BACKUP_STALE_DAYS,
  CERT_EXPIRING_DAYS,
  MAX_SIZE_BYTES,
  AUTO_BACKUP_FORMAT,
  SENSITIVE_FIELDS,
  PERSONAL_DATA_MODELS,
} from "./backup.constants.ts";
export {
  isReportSecretConfigured,
  extractBearerToken,
  constantTimeEqual,
  isReportAuthorized,
} from "./backup.auth.ts";
export {
  type ParseResult,
  cleanText,
  sanitizeGithubUrl,
  normalizeSha256,
} from "./backup.parse-helpers.ts";
export {
  type BackupKindName,
  type BackupStatusName,
  type BackupReport,
  parseBackupReport,
} from "./backup.report.ts";
export {
  type HandoverInput,
  parseSizeInput,
  looksLikeSecret,
  parseHandoverInput,
  buildHandoverNote,
} from "./backup.handover.ts";
export {
  exportModels,
  redactRow,
  delegateName,
  exportFileName,
} from "./backup.json-export.ts";
export {
  formatBytes,
  type AutoBackupHealth,
  autoBackupHealth,
  daysUntil,
  type CertificateState,
  certificateState,
  type SiteUrlInfo,
  siteUrlInfo,
  type EnvPresence,
  envPresence,
} from "./backup.health.ts";
export { parseGithubRepo, parseGitRef, shortCommit } from "./backup.git.ts";