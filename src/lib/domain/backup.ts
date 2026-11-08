import { createHash, timingSafeEqual } from "node:crypto";

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
 */

/* ---------- Konstanta ---------- */

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

const LOCATION_MAX = 200;
const NOTE_MAX = 500;
const REPORT_NOTE_MAX = 300;
const FORMAT_MAX = 80;

/** Format bawaan backup otomatis (lihat `.github/workflows/backup.yml`). */
export const AUTO_BACKUP_FORMAT = "pg_dump .sql.gz terenkripsi (GPG AES-256)";

/** Field yang tidak boleh keluar dari database lewat ekspor JSON. */
export const SENSITIVE_FIELDS: Readonly<Record<string, readonly string[]>> = {
  AdminUser: ["passwordHash"],
};

/** Model yang isinya data pribadi pengunjung (UU PDP) — ekspornya harus dipilih sadar. */
export const PERSONAL_DATA_MODELS: readonly string[] = ["CorporateInquiry"];

/* ---------- Autentikasi laporan backup otomatis ---------- */

/** Secret dianggap terpasang hanya bila cukup panjang (mencegah secret lemah/kosong). */
export function isReportSecretConfigured(secret: string | undefined | null): secret is string {
  return typeof secret === "string" && secret.trim().length >= MIN_REPORT_SECRET_LENGTH;
}

/** Ambil token dari header `Authorization: Bearer <token>`. */
export function extractBearerToken(header: string | null | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer[ \t]+(\S+)[ \t]*$/i.exec(header);
  return match ? match[1] : null;
}

/** Perbandingan konstan-waktu; panjang berbeda tidak membocorkan informasi karena keduanya di-hash dulu. */
export function constantTimeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a, "utf8").digest();
  const right = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(left, right);
}

/**
 * true hanya bila secret server terpasang (≥ 32 karakter) DAN header membawa
 * token yang sama persis. Secret kosong → selalu ditolak (fail-closed).
 */
export function isReportAuthorized(
  authorizationHeader: string | null | undefined,
  secret: string | undefined | null,
): boolean {
  if (!isReportSecretConfigured(secret)) return false;
  const token = extractBearerToken(authorizationHeader);
  if (!token) return false;
  return constantTimeEqual(token, secret.trim());
}

/* ---------- Validasi laporan dari GitHub Actions ---------- */

export type BackupKindName = "MANUAL" | "AUTO" | "HANDOVER";
export type BackupStatusName = "SUCCESS" | "FAILED";

export type BackupReport = {
  kind: Exclude<BackupKindName, "HANDOVER">;
  status: BackupStatusName;
  format: string;
  sizeBytes: number | null;
  location: string | null;
  note: string | null;
  /** ID admin yang memicu lewat dashboard (opsional). */
  requestedBy: string | null;
};

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Hapus karakter kontrol & rapikan spasi agar teks aman ditampilkan di admin. */
export function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

/**
 * Hanya URL https ke github.com tanpa kredensial yang diterima sebagai lokasi
 * backup. Query dan fragmen dibuang (bisa memuat token sementara).
 */
export function sanitizeGithubUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.hostname !== "github.com") return null;
  url.search = "";
  url.hash = "";
  return url.toString();
}

/** Ambil hash SHA-256 dari input bebas (mis. baris keluaran `shasum -a 256 file`). */
export function normalizeSha256(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const first = raw.trim().split(/\s+/)[0] ?? "";
  const value = first.replace(/^sha256[:=]/i, "").toLowerCase();
  return /^[0-9a-f]{64}$/.test(value) ? value : null;
}

function parseSizeNumber(raw: unknown): number | null | undefined {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.trim()) : NaN;
  if (!Number.isInteger(n) || n < 0 || n > MAX_SIZE_BYTES) return undefined;
  return n;
}

/** Validasi body JSON laporan backup dari workflow GitHub Actions. */
export function parseBackupReport(input: unknown): ParseResult<BackupReport> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "Body harus berupa objek JSON." };
  }
  const body = input as Record<string, unknown>;

  const rawStatus = typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
  let status: BackupStatusName;
  if (rawStatus === "success") status = "SUCCESS";
  else if (["failure", "failed", "cancelled", "error"].includes(rawStatus)) status = "FAILED";
  else return { ok: false, error: "status harus success atau failure." };

  const trigger = typeof body.trigger === "string" ? body.trigger.trim() : "schedule";
  let kind: BackupReport["kind"];
  if (trigger === "schedule" || trigger === "") kind = "AUTO";
  else if (trigger === "workflow_dispatch") kind = "MANUAL";
  else return { ok: false, error: "trigger harus schedule atau workflow_dispatch." };

  const sizeBytes = parseSizeNumber(body.sizeBytes);
  if (sizeBytes === undefined) {
    return { ok: false, error: "sizeBytes harus bilangan bulat ≥ 0." };
  }

  let sha256: string | null = null;
  if (body.sha256 !== undefined && body.sha256 !== null && body.sha256 !== "") {
    sha256 = normalizeSha256(body.sha256);
    if (!sha256) return { ok: false, error: "sha256 harus 64 karakter heksadesimal." };
  }

  let runNumber: number | null = null;
  if (body.runNumber !== undefined && body.runNumber !== null && body.runNumber !== "") {
    const n = Number(body.runNumber);
    if (!Number.isInteger(n) || n <= 0) return { ok: false, error: "runNumber tidak valid." };
    runNumber = n;
  }

  let requestedBy: string | null = null;
  if (typeof body.requestedBy === "string" && body.requestedBy.trim()) {
    const id = body.requestedBy.trim();
    if (!/^[a-z0-9]{20,40}$/i.test(id)) return { ok: false, error: "requestedBy tidak valid." };
    requestedBy = id;
  }

  const link = sanitizeGithubUrl(body.artifactUrl) ?? sanitizeGithubUrl(body.runUrl);
  const label = runNumber ? `GitHub Actions run #${runNumber}` : "GitHub Actions";
  const location = cleanText(link ? `${label} — ${link}` : label, LOCATION_MAX);

  const noteParts = [
    sha256 ? `SHA-256: ${sha256}` : null,
    cleanText(body.note, REPORT_NOTE_MAX),
  ].filter(Boolean);

  return {
    ok: true,
    value: {
      kind,
      status,
      format: cleanText(body.format, FORMAT_MAX) ?? AUTO_BACKUP_FORMAT,
      sizeBytes,
      location,
      note: noteParts.length ? noteParts.join(" · ") : null,
      requestedBy,
    },
  };
}

/* ---------- Catatan backup serah terima ---------- */

export type HandoverInput = {
  location: string;
  sha256: string;
  sizeBytes: number | null;
  restoreTested: boolean;
  note: string | null;
};

const SIZE_UNITS: Record<string, number> = {
  "": 1,
  b: 1,
  k: 1024,
  kb: 1024,
  m: 1024 ** 2,
  mb: 1024 ** 2,
  g: 1024 ** 3,
  gb: 1024 ** 3,
};

/** "123456", "1.2M", "850 KB", "1,5 MB" → byte. null = kosong, undefined = tidak valid. */
export function parseSizeInput(raw: string | null | undefined): number | null | undefined {
  const value = (raw ?? "").trim();
  if (!value) return null;
  const match = /^(\d+(?:[.,]\d+)?)\s*([a-z]*)$/i.exec(value);
  if (!match) return undefined;
  const unit = SIZE_UNITS[match[2].toLowerCase()];
  if (unit === undefined) return undefined;
  const bytes = Math.round(Number(match[1].replace(",", ".")) * unit);
  if (!Number.isFinite(bytes) || bytes < 0 || bytes > MAX_SIZE_BYTES) return undefined;
  return bytes;
}

/** Teks yang tampak seperti kredensial tidak boleh masuk catatan lokasi. */
export function looksLikeSecret(value: string): boolean {
  if (/postgres(ql)?:\/\//i.test(value)) return true;
  if (/:\/\/[^/\s]*:[^/\s]*@/.test(value)) return true; // user:pass@host
  if (/(password|passphrase|token|secret)\s*[:=]/i.test(value)) return true;
  return false;
}

export function parseHandoverInput(fields: {
  location: string | null | undefined;
  sha256: string | null | undefined;
  sizeBytes: string | null | undefined;
  restoreTested: boolean;
  note: string | null | undefined;
}): ParseResult<HandoverInput> {
  const location = cleanText(fields.location, LOCATION_MAX + 1);
  if (!location) return { ok: false, error: "Lokasi penyimpanan wajib diisi." };
  if (location.length > LOCATION_MAX) {
    return { ok: false, error: `Lokasi maksimal ${LOCATION_MAX} karakter.` };
  }

  const sha256 = normalizeSha256(fields.sha256);
  if (!sha256) {
    return {
      ok: false,
      error: "Checksum SHA-256 wajib diisi (64 karakter heksadesimal dari keluaran scripts/backup-db.sh).",
    };
  }

  const sizeBytes = parseSizeInput(fields.sizeBytes);
  if (sizeBytes === undefined) {
    return { ok: false, error: "Ukuran tidak valid. Contoh: 1234567, 850 KB, atau 1,2 MB." };
  }

  const note = cleanText(fields.note, NOTE_MAX + 1);
  if (note && note.length > NOTE_MAX) {
    return { ok: false, error: `Catatan maksimal ${NOTE_MAX} karakter.` };
  }

  if (looksLikeSecret(location) || (note && looksLikeSecret(note))) {
    return {
      ok: false,
      error:
        "Jangan menulis connection string, password, atau passphrase di sini. Simpan passphrase terpisah (mis. password manager).",
    };
  }

  return { ok: true, value: { location, sha256, sizeBytes, restoreTested: fields.restoreTested, note } };
}

export function buildHandoverNote(input: HandoverInput): string {
  return [
    `SHA-256: ${input.sha256}`,
    `Uji restore: ${input.restoreTested ? "sudah berhasil" : "belum"}`,
    input.note,
  ]
    .filter(Boolean)
    .join(" · ");
}

/* ---------- Ekspor JSON ---------- */

/** Daftar model yang diekspor; data inquiry hanya ikut bila diminta eksplisit. */
export function exportModels(
  all: readonly string[],
  options: { includePersonalData: boolean },
): string[] {
  return all.filter(
    (model) => options.includePersonalData || !PERSONAL_DATA_MODELS.includes(model),
  );
}

/** Salinan baris tanpa field sensitif (lapis kedua setelah `omit` di query). */
export function redactRow(model: string, row: Record<string, unknown>): Record<string, unknown> {
  const hidden = SENSITIVE_FIELDS[model];
  if (!hidden?.length) return row;
  const copy: Record<string, unknown> = { ...row };
  for (const field of hidden) delete copy[field];
  return copy;
}

/** `AdminUser` → `adminUser` (nama delegate Prisma Client). */
export function delegateName(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** `kamaspa-data-20261108-153000.json` (waktu WIB). */
export function exportFileName(date: Date): string {
  const wib = new Date(date.getTime() + WIB_OFFSET_MS).toISOString(); // 2026-11-08T15:30:00.000Z
  const stamp = `${wib.slice(0, 10).replaceAll("-", "")}-${wib.slice(11, 19).replaceAll(":", "")}`;
  return `kamaspa-data-${stamp}.json`;
}

/* ---------- Tampilan & status ---------- */

/** 1536 → "1,5 KB" (basis 1024, format Indonesia). */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const text = value.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  return `${text} ${units[i]}`;
}

export type AutoBackupHealth = "ok" | "stale" | "never";

/** Sehat bila backup otomatis sukses dalam 8 hari terakhir (jadwal mingguan + toleransi). */
export function autoBackupHealth(
  lastSuccessAt: Date | null | undefined,
  now: Date,
  staleDays = AUTO_BACKUP_STALE_DAYS,
): AutoBackupHealth {
  if (!lastSuccessAt) return "never";
  const ageMs = now.getTime() - lastSuccessAt.getTime();
  return ageMs > staleDays * 24 * 60 * 60 * 1000 ? "stale" : "ok";
}

/** Sisa hari (dibulatkan ke bawah); negatif bila sudah lewat. */
export function daysUntil(target: Date, now: Date): number {
  return Math.floor((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

export type CertificateState = "valid" | "expiring" | "expired" | "invalid" | "unknown";

export function certificateState(
  cert: { validTo: Date | null; authorized: boolean } | null,
  now: Date,
): CertificateState {
  if (!cert || !cert.validTo || Number.isNaN(cert.validTo.getTime())) return "unknown";
  const days = daysUntil(cert.validTo, now);
  if (days < 0) return "expired";
  if (!cert.authorized) return "invalid";
  if (days < CERT_EXPIRING_DAYS) return "expiring";
  return "valid";
}

export type SiteUrlInfo = {
  url: string;
  host: string;
  isHttps: boolean;
  /** localhost / IP — sertifikat tidak diperiksa. */
  isLocal: boolean;
};

export function siteUrlInfo(raw: string): SiteUrlInfo | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname;
  const isLocal =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.includes(":") ||
    host.startsWith("[");
  return { url: url.origin, host, isHttps: url.protocol === "https:", isLocal };
}

export type EnvPresence = { name: string; set: boolean };

/** Hanya terisi/kosong — nilai env TIDAK pernah dikembalikan. */
export function envPresence(
  env: Readonly<Record<string, string | undefined>>,
  names: readonly string[],
): EnvPresence[] {
  return names.map((name) => ({ name, set: Boolean(env[name]?.trim()) }));
}

/** `owner/nama-repo` → objek, atau null bila formatnya tidak sah. */
export function parseGithubRepo(raw: string | undefined | null): { owner: string; repo: string } | null {
  const value = (raw ?? "").trim();
  const match = /^([A-Za-z0-9-]{1,39})\/([A-Za-z0-9_.-]{1,100})$/.exec(value);
  if (!match) return null;
  if (match[2] === "." || match[2] === ".." || match[2].includes("..")) return null;
  return { owner: match[1], repo: match[2] };
}

/** Nama branch/tag aman untuk `workflow_dispatch` (default `main`). */
export function parseGitRef(raw: string | undefined | null): string | null {
  const value = (raw ?? "").trim() || "main";
  if (!/^[A-Za-z0-9._/-]{1,100}$/.test(value)) return null;
  if (value.includes("..") || value.startsWith("/") || value.endsWith("/")) return null;
  return value;
}

/** 7 karakter pertama commit SHA (validasi heksadesimal). */
export function shortCommit(sha: string | undefined | null): string | null {
  const value = (sha ?? "").trim().toLowerCase();
  return /^[0-9a-f]{7,40}$/.test(value) ? value.slice(0, 7) : null;
}
