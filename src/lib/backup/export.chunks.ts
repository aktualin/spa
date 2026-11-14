/** Generator potongan JSON ekspor data — lihat `export.ts`. */
import { Prisma } from "@prisma/client";

import {
  PERSONAL_DATA_MODELS,
  SENSITIVE_FIELDS,
  delegateName,
  exportModels,
  redactRow,
} from "@/lib/domain/backup";
import { prisma } from "@/lib/prisma";

const BATCH_SIZE = 500;

type Row = Record<string, unknown> & { id: string };
type Delegate = { findMany(args: unknown): Promise<Row[]> };

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

export async function* generateChunks(
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