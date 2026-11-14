/** Tampilan & status backup/situs — lihat `backup.ts`. */
import { AUTO_BACKUP_STALE_DAYS, CERT_EXPIRING_DAYS } from "./backup.constants.ts";

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