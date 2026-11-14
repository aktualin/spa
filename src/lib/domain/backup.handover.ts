/** Catatan backup serah terima — lihat `backup.ts`. */
import { LOCATION_MAX, MAX_SIZE_BYTES, NOTE_MAX } from "./backup.constants.ts";
import {
  type ParseResult,
  cleanText,
  normalizeSha256,
} from "./backup.parse-helpers.ts";

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