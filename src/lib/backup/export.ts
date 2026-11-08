import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";

import {
  PERSONAL_DATA_MODELS,
  SENSITIVE_FIELDS,
  delegateName,
  exportModels,
  redactRow,
} from "@/lib/domain/backup";
import { prisma } from "@/lib/prisma";

/**
 * Ekspor JSON seluruh tabel (backup data), di-stream langsung ke browser admin.
 *
 * - Tidak ada yang ditulis ke disk server maupun storage (bucket storage
 *   bersifat publik — UU PDP).
 * - `passwordHash` dibuang dua lapis: `omit` di query + `redactRow`.
 * - Ini backup DATA, bukan pengganti pg_dump: struktur tabel, index, dan
 *   riwayat migrasi tidak ikut. Restore penuh tetap memakai pg_dump.
 * - Dibaca per halaman (cursor `id`) agar memori tetap kecil; tidak dalam satu
 *   transaksi, jadi perubahan yang terjadi selama ekspor bisa ikut sebagian.
 */

const BATCH_SIZE = 500;

type Row = Record<string, unknown> & { id: string };
type Delegate = { findMany(args: unknown): Promise<Row[]> };

export type ExportResult =
  | { ok: true; sizeBytes: number; sha256: string; counts: Record<string, number> }
  | { ok: false; sizeBytes: number; reason: string };

function delegateFor(model: string): Delegate {
  const client = prisma as unknown as Record<string, Delegate | undefined>;
  const delegate = client[delegateName(model)];
  if (!delegate) throw new Error(`Delegate Prisma untuk ${model} tidak ditemukan`);
  return delegate;
}

function omitFor(model: string): Record<string, true> | undefined {
  const fields = SENSITIVE_FIELDS[model];
  return fields?.length ? Object.fromEntries(fields.map((f) => [f, true])) : undefined;
}

async function* generateChunks(
  options: { includePersonalData: boolean; exportedBy: string; now: Date },
  counts: Record<string, number>,
): AsyncGenerator<string> {
  const models = exportModels(Object.values(Prisma.ModelName), {
    includePersonalData: options.includePersonalData,
  });

  const meta = {
    format: "kamaspa-json-export",
    version: 1,
    exportedAt: options.now.toISOString(),
    exportedBy: options.exportedBy,
    includesPersonalData: options.includePersonalData,
    excludedModels: options.includePersonalData ? [] : PERSONAL_DATA_MODELS,
    omittedFields: SENSITIVE_FIELDS,
    notice:
      "Backup data (isi tabel) — bukan pengganti pg_dump. Struktur tabel, index, dan riwayat migrasi tidak ikut; restore penuh memakai backup pg_dump (scripts/backup-db.sh). Berkas ini berisi data pribadi: simpan terenkripsi, jangan diunggah ke storage publik.",
  };

  yield `{"meta":${JSON.stringify(meta)},"data":{`;

  for (const [index, model] of models.entries()) {
    yield `${index ? "," : ""}${JSON.stringify(model)}:[`;
    const delegate = delegateFor(model);
    const omit = omitFor(model);
    let cursor: string | undefined;
    let count = 0;

    for (;;) {
      const rows = await delegate.findMany({
        take: BATCH_SIZE,
        orderBy: { id: "asc" },
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        ...(omit ? { omit } : {}),
      });
      if (rows.length) {
        const body = rows.map((row) => JSON.stringify(redactRow(model, row))).join(",");
        yield `${count ? "," : ""}${body}`;
        count += rows.length;
      }
      if (rows.length < BATCH_SIZE) break;
      cursor = rows[rows.length - 1].id;
    }

    counts[model] = count;
    yield "]";
  }

  yield `},"summary":${JSON.stringify({ counts, finishedAt: new Date().toISOString() })}}`;
}

/**
 * Stream JSON + penghitung ukuran & SHA-256. `onFinish` dipanggil tepat sekali:
 * sukses setelah byte terakhir terkirim, gagal bila error atau dibatalkan.
 */
export function createJsonExportStream(options: {
  includePersonalData: boolean;
  exportedBy: string;
  onFinish: (result: ExportResult) => Promise<void>;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const hash = createHash("sha256");
  const counts: Record<string, number> = {};
  const iterator = generateChunks(
    { includePersonalData: options.includePersonalData, exportedBy: options.exportedBy, now: new Date() },
    counts,
  );
  let sizeBytes = 0;
  let finished = false;

  async function finish(result: ExportResult) {
    if (finished) return;
    finished = true;
    try {
      await options.onFinish(result);
    } catch (error) {
      console.error("[backup] gagal mencatat BackupRun", error instanceof Error ? error.name : error);
    }
  }

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) {
          await finish({ ok: true, sizeBytes, sha256: hash.digest("hex"), counts });
          controller.close();
          return;
        }
        const chunk = encoder.encode(value);
        hash.update(chunk);
        sizeBytes += chunk.byteLength;
        controller.enqueue(chunk);
      } catch (error) {
        const reason = error instanceof Error ? error.name : "unknown";
        await finish({ ok: false, sizeBytes, reason: `Ekspor gagal (${reason}).` });
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return(undefined);
      await finish({ ok: false, sizeBytes, reason: "Unduhan dibatalkan sebelum selesai." });
    },
  });
}
