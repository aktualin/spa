import { createHash } from "node:crypto";

import { generateChunks } from "./export.chunks";

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

export type ExportResult =
  | { ok: true; sizeBytes: number; sha256: string; counts: Record<string, number> }
  | { ok: false; sizeBytes: number; reason: string };

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