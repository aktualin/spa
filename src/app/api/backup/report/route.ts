import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { backupReportLimiter } from "@/lib/backup/limits";
import {
  REPORT_MAX_BODY_BYTES,
  isReportAuthorized,
  isReportSecretConfigured,
  parseBackupReport,
} from "@/lib/domain/backup";
import { extractClientIp } from "@/lib/domain/inquiry";
import { prisma } from "@/lib/prisma";

/**
 * `POST /api/backup/report` — dipanggil workflow GitHub Actions
 * (`.github/workflows/backup.yml`) setelah backup selesai/gagal, untuk mencatat
 * `BackupRun` (AUTO untuk jadwal, MANUAL untuk workflow_dispatch).
 *
 * Proxy TIDAK menjaga `/api/backup/*`, jadi autentikasi ada di sini:
 * `Authorization: Bearer <BACKUP_REPORT_SECRET>` dibandingkan konstan-waktu.
 * Secret kosong/pendek → 503 (fail-closed). Endpoint ini hanya menerima
 * metadata (status, ukuran, checksum, URL run) — tidak pernah isi backup.
 */

// Tanpa `runtime`/`dynamic`: `cacheComponents` menolak route segment config.

function json(body: Record<string, unknown>, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store", ...(headers ?? {}) },
  });
}

function rateLimitKey(ip: string): string {
  return createHash("sha256").update(`backup-report:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  const secret = process.env.BACKUP_REPORT_SECRET;
  if (!isReportSecretConfigured(secret)) {
    return json({ error: "Pencatatan backup belum dikonfigurasi." }, 503);
  }

  const limit = backupReportLimiter.check(rateLimitKey(extractClientIp(request.headers)));
  if (!limit.allowed) {
    return json({ error: "Terlalu banyak permintaan." }, 429, {
      "retry-after": String(Math.ceil(limit.retryAfterMs / 1000)),
    });
  }

  if (!isReportAuthorized(request.headers.get("authorization"), secret)) {
    return json({ error: "Tidak terotorisasi." }, 401);
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > REPORT_MAX_BODY_BYTES) return json({ error: "Body terlalu besar." }, 413);

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ error: "Body tidak terbaca." }, 400);
  }
  if (new TextEncoder().encode(raw).byteLength > REPORT_MAX_BODY_BYTES) {
    return json({ error: "Body terlalu besar." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Body harus JSON." }, 400);
  }

  const parsed = parseBackupReport(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const report = parsed.value;

  // Admin pemicu (dari tombol dashboard) hanya ditautkan bila akunnya ADMIN aktif.
  let triggeredById: string | null = null;
  if (report.requestedBy) {
    const admin = await prisma.adminUser.findFirst({
      where: { id: report.requestedBy, role: "ADMIN", isActive: true },
      select: { id: true },
    });
    triggeredById = admin?.id ?? null;
  }

  const run = await prisma.backupRun.create({
    data: {
      kind: report.kind,
      status: report.status,
      format: report.format,
      sizeBytes: report.sizeBytes,
      location: report.location,
      note: report.note,
      triggeredById,
    },
    select: { id: true },
  });

  return json({ id: run.id }, 201);
}
