import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  autoBackupHealth,
  buildHandoverNote,
  certificateState,
  constantTimeEqual,
  delegateName,
  envPresence,
  exportFileName,
  exportModels,
  extractBearerToken,
  formatBytes,
  isReportAuthorized,
  isReportSecretConfigured,
  looksLikeSecret,
  normalizeSha256,
  parseBackupReport,
  parseGitRef,
  parseGithubRepo,
  parseHandoverInput,
  parseSizeInput,
  redactRow,
  sanitizeGithubUrl,
  shortCommit,
  siteUrlInfo,
} from "../../src/lib/domain/backup.ts";

const SECRET = "s".repeat(40);
const SHA = "a".repeat(64);

describe("autentikasi laporan backup", () => {
  it("menolak bila secret server kosong atau terlalu pendek (fail-closed)", () => {
    assert.equal(isReportSecretConfigured(undefined), false);
    assert.equal(isReportSecretConfigured(""), false);
    assert.equal(isReportSecretConfigured("pendek"), false);
    assert.equal(isReportAuthorized("Bearer ", ""), false);
    assert.equal(isReportAuthorized("Bearer pendek", "pendek"), false);
  });

  it("menerima token yang sama persis", () => {
    assert.equal(isReportAuthorized(`Bearer ${SECRET}`, SECRET), true);
    assert.equal(isReportAuthorized(`bearer ${SECRET}`, `${SECRET}\n`), true);
  });

  it("menolak token salah, kosong, atau skema lain", () => {
    assert.equal(isReportAuthorized(`Bearer ${SECRET}x`, SECRET), false);
    assert.equal(isReportAuthorized(`Bearer ${"t".repeat(40)}`, SECRET), false);
    assert.equal(isReportAuthorized(null, SECRET), false);
    assert.equal(isReportAuthorized(`Basic ${SECRET}`, SECRET), false);
    assert.equal(isReportAuthorized(SECRET, SECRET), false);
  });

  it("extractBearerToken & constantTimeEqual", () => {
    assert.equal(extractBearerToken("Bearer abc"), "abc");
    assert.equal(extractBearerToken("Bearer a b"), null);
    assert.equal(constantTimeEqual("abc", "abc"), true);
    assert.equal(constantTimeEqual("abc", "abcd"), false);
  });
});

describe("parseBackupReport", () => {
  it("laporan jadwal sukses → AUTO SUCCESS dengan lokasi & checksum", () => {
    const result = parseBackupReport({
      status: "success",
      trigger: "schedule",
      sizeBytes: 12345,
      sha256: SHA.toUpperCase(),
      runNumber: 42,
      runUrl: "https://github.com/klien/kamaspa/actions/runs/99?token=rahasia#x",
    });
    assert.ok(result.ok);
    assert.equal(result.value.kind, "AUTO");
    assert.equal(result.value.status, "SUCCESS");
    assert.equal(result.value.sizeBytes, 12345);
    assert.equal(
      result.value.location,
      "GitHub Actions run #42 — https://github.com/klien/kamaspa/actions/runs/99",
    );
    assert.match(result.value.note ?? "", new RegExp(`SHA-256: ${SHA}`));
  });

  it("artifactUrl diutamakan dan workflow_dispatch → MANUAL", () => {
    const result = parseBackupReport({
      status: "failure",
      trigger: "workflow_dispatch",
      artifactUrl: "https://github.com/klien/kamaspa/actions/runs/1/artifacts/7",
      runUrl: "https://github.com/klien/kamaspa/actions/runs/1",
      requestedBy: "clx1234567890abcdefghijk",
      note: "pg_dump\u0000 gagal\nkoneksi",
    });
    assert.ok(result.ok);
    assert.equal(result.value.kind, "MANUAL");
    assert.equal(result.value.status, "FAILED");
    assert.match(result.value.location ?? "", /artifacts\/7$/);
    assert.equal(result.value.requestedBy, "clx1234567890abcdefghijk");
    assert.equal(result.value.note, "pg_dump gagal koneksi");
  });

  it("menolak input tidak sah", () => {
    assert.equal(parseBackupReport(null).ok, false);
    assert.equal(parseBackupReport([]).ok, false);
    assert.equal(parseBackupReport({ status: "ok" }).ok, false);
    assert.equal(parseBackupReport({ status: "success", trigger: "push" }).ok, false);
    assert.equal(parseBackupReport({ status: "success", sizeBytes: -1 }).ok, false);
    assert.equal(parseBackupReport({ status: "success", sizeBytes: 1.5 }).ok, false);
    assert.equal(parseBackupReport({ status: "success", sha256: "xyz" }).ok, false);
    assert.equal(parseBackupReport({ status: "success", requestedBy: "../x" }).ok, false);
  });

  it("URL selain https://github.com tanpa kredensial diabaikan", () => {
    assert.equal(sanitizeGithubUrl("http://github.com/a"), null);
    assert.equal(sanitizeGithubUrl("https://user:pass@github.com/a"), null);
    assert.equal(sanitizeGithubUrl("https://evil.example/a"), null);
    assert.equal(sanitizeGithubUrl("https://github.com.evil.example/a"), null);
    const result = parseBackupReport({ status: "success", runUrl: "https://evil.example/x" });
    assert.ok(result.ok);
    assert.equal(result.value.location, "GitHub Actions");
  });
});

describe("catatan backup serah terima", () => {
  const base = {
    location: "Google Drive klien › Serah Terima › kamaspa-20261108.sql.gz",
    sha256: `${SHA}  backups/kamaspa-20261108-120000.sql.gz`,
    sizeBytes: "1,5 MB",
    restoreTested: true,
    note: "Diserahkan ke PIC",
  };

  it("menerima keluaran shasum apa adanya", () => {
    const result = parseHandoverInput(base);
    assert.ok(result.ok);
    assert.equal(result.value.sha256, SHA);
    assert.equal(result.value.sizeBytes, Math.round(1.5 * 1024 * 1024));
    assert.equal(
      buildHandoverNote(result.value),
      `SHA-256: ${SHA} · Uji restore: sudah berhasil · Diserahkan ke PIC`,
    );
  });

  it("wajib lokasi & checksum sah", () => {
    assert.equal(parseHandoverInput({ ...base, location: " " }).ok, false);
    assert.equal(parseHandoverInput({ ...base, sha256: "abc" }).ok, false);
    assert.equal(parseHandoverInput({ ...base, sizeBytes: "banyak" }).ok, false);
    assert.equal(parseHandoverInput({ ...base, location: "x".repeat(201) }).ok, false);
  });

  it("menolak connection string / kredensial", () => {
    assert.equal(
      parseHandoverInput({ ...base, location: "postgresql://u:p@host:5432/db" }).ok,
      false,
    );
    assert.equal(parseHandoverInput({ ...base, note: "passphrase: rahasia123" }).ok, false);
    assert.equal(looksLikeSecret("https://user:pw@drive.example/file"), true);
    assert.equal(looksLikeSecret("Google Drive klien, folder Backup"), false);
  });

  it("parseSizeInput", () => {
    assert.equal(parseSizeInput(""), null);
    assert.equal(parseSizeInput("2048"), 2048);
    assert.equal(parseSizeInput("850 KB"), 850 * 1024);
    assert.equal(parseSizeInput("1.2M"), Math.round(1.2 * 1024 * 1024));
    assert.equal(parseSizeInput("3 TB"), undefined);
    assert.equal(parseSizeInput("-1"), undefined);
  });

  it("normalizeSha256", () => {
    assert.equal(normalizeSha256(`sha256:${SHA.toUpperCase()}`), SHA);
    assert.equal(normalizeSha256("a".repeat(63)), null);
    assert.equal(normalizeSha256(undefined), null);
  });
});

describe("ekspor JSON", () => {
  it("passwordHash admin tidak pernah ikut", () => {
    const row = { id: "1", email: "a@b.c", passwordHash: "scrypt$..." };
    const out = redactRow("AdminUser", row);
    assert.equal("passwordHash" in out, false);
    assert.equal(out.email, "a@b.c");
    // Baris asli tidak diubah.
    assert.equal(row.passwordHash, "scrypt$...");
    assert.deepEqual(redactRow("Treatment", { id: "x" }), { id: "x" });
  });

  it("data inquiry hanya ikut bila dipilih", () => {
    const all = ["AdminUser", "CorporateInquiry", "Treatment"];
    assert.deepEqual(exportModels(all, { includePersonalData: false }), ["AdminUser", "Treatment"]);
    assert.deepEqual(exportModels(all, { includePersonalData: true }), all);
  });

  it("nama delegate & nama berkas (WIB)", () => {
    assert.equal(delegateName("AdminUser"), "adminUser");
    assert.equal(
      exportFileName(new Date("2026-11-08T08:30:05Z")),
      "kamaspa-data-20261108-153005.json",
    );
  });
});

describe("status & tampilan", () => {
  it("formatBytes", () => {
    assert.equal(formatBytes(null), "—");
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(1536), "1,5 KB");
    assert.equal(formatBytes(5 * 1024 * 1024), "5 MB");
  });

  it("autoBackupHealth", () => {
    const now = new Date("2026-11-08T00:00:00Z");
    assert.equal(autoBackupHealth(null, now), "never");
    assert.equal(autoBackupHealth(new Date("2026-11-02T00:00:00Z"), now), "ok");
    assert.equal(autoBackupHealth(new Date("2026-10-30T00:00:00Z"), now), "stale");
  });

  it("certificateState", () => {
    const now = new Date("2026-11-08T00:00:00Z");
    const days = (n: number) => new Date(now.getTime() + n * 86_400_000);
    assert.equal(certificateState(null, now), "unknown");
    assert.equal(certificateState({ validTo: days(60), authorized: true }, now), "valid");
    assert.equal(certificateState({ validTo: days(5), authorized: true }, now), "expiring");
    assert.equal(certificateState({ validTo: days(-1), authorized: true }, now), "expired");
    assert.equal(certificateState({ validTo: days(60), authorized: false }, now), "invalid");
  });

  it("siteUrlInfo", () => {
    assert.deepEqual(siteUrlInfo("https://kamaspa.id/"), {
      url: "https://kamaspa.id",
      host: "kamaspa.id",
      isHttps: true,
      isLocal: false,
    });
    assert.equal(siteUrlInfo("http://localhost:3000")?.isLocal, true);
    assert.equal(siteUrlInfo("http://localhost:3000")?.isHttps, false);
    assert.equal(siteUrlInfo("ftp://kamaspa.id"), null);
    assert.equal(siteUrlInfo("bukan url"), null);
  });

  it("envPresence tidak pernah membawa nilai", () => {
    const result = envPresence({ A: "rahasia", B: "  ", C: undefined }, ["A", "B", "C"]);
    assert.deepEqual(result, [
      { name: "A", set: true },
      { name: "B", set: false },
      { name: "C", set: false },
    ]);
    assert.equal(JSON.stringify(result).includes("rahasia"), false);
  });

  it("parseGithubRepo, parseGitRef, shortCommit", () => {
    assert.deepEqual(parseGithubRepo("klien/kamaspa"), { owner: "klien", repo: "kamaspa" });
    assert.equal(parseGithubRepo("klien/../x"), null);
    assert.equal(parseGithubRepo("https://github.com/klien/kamaspa"), null);
    assert.equal(parseGithubRepo(undefined), null);
    assert.equal(parseGitRef(undefined), "main");
    assert.equal(parseGitRef("release/v1"), "release/v1");
    assert.equal(parseGitRef("a..b"), null);
    assert.equal(shortCommit("ABCDEF1234567890"), "abcdef1");
    assert.equal(shortCommit("zzz"), null);
  });
});
