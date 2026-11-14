/** Validasi laporan dari GitHub Actions — lihat `backup.ts`. */
import {
  AUTO_BACKUP_FORMAT,
  FORMAT_MAX,
  LOCATION_MAX,
  REPORT_NOTE_MAX,
} from "./backup.constants.ts";
import {
  type ParseResult,
  cleanText,
  normalizeSha256,
  parseSizeNumber,
  sanitizeGithubUrl,
} from "./backup.parse-helpers.ts";

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