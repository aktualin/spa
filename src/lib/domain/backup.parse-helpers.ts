/** Helper parsing laporan & catatan backup — lihat `backup.ts`. */
import { MAX_SIZE_BYTES } from "./backup.constants.ts";
import { collapseControlChars } from "./text.ts";

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseSizeNumber(raw: unknown): number | null | undefined {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.trim()) : NaN;
  if (!Number.isInteger(n) || n < 0 || n > MAX_SIZE_BYTES) return undefined;
  return n;
}

/** Hapus karakter kontrol & rapikan spasi agar teks aman ditampilkan di admin. */
export function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = collapseControlChars(value);
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