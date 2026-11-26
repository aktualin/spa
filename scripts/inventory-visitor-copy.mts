/**
 * Inventarisasi copy visitor dari database — READ-ONLY, tidak mengubah apa pun.
 * Dump nilai live (sumber `old` untuk migrasi English) + flag heuristik
 * stopword Indonesia. Kolom nama proper/label admin tidak diflag.
 * Baris sisa e2e (`slug LIKE 'e2e-%'`) disaring. Tanpa tabel PII.
 *
 *   node scripts/inventory-visitor-copy.mts [out.json]
 *
 * Output default: $CLAUDE_JOB_DIR/tmp/visitor-copy-inventory.json (bukan repo).
 */
import "./load-env.mts";

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { INVENTORY_TABLES, KEEP_AS_IS } from "./english-copy/tables.mts";

const schema = process.env.DATABASE_SCHEMA || "public";
const prisma = new PrismaClient({
  adapter: new PrismaPg(
    { connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! },
    { schema },
  ),
});

// Kata fungsi Indonesia yang tidak ambigu (nama bulan yang sama dengan
// English — april/september/oktober/november/desember — sengaja tidak ikut).
const STOPWORD =
  /\b(yang|dan|di|ke|dari|untuk|dengan|atau|pada|adalah|ini|itu|kami|kita|anda|silakan|mohon|tidak|bisa|dapat|akan|sudah|belum|lebih|setiap|bulan|tahun|hari|jam|menit|harga|gratis|dapatkan|nikmati|rasakan|layanan|perawatan|pilihan|tersedia|hanya|juga|saat|agar|supaya|bagi|semua|seluruh|tanpa|termasuk|selama|setelah|sebelum|kini|telah|sedang|masih|harus|wajib|boleh|jangan|hubungi|kirim|baca|lihat|buka|tutup|pilih|tampilkan|sebelumnya|berikutnya|gambar|foto|ulasan|pelanggan|tanggal|menyusul|terlalu|banyak|permintaan|kesalahan|coba|lagi|beberapa|lengkapi|nomor|telepon|pesan|setujui|pemrosesan|formulir|terkirim|cepat|periksa|isian|ulang|verifikasi|kedaluwarsa|selesaikan|sementara|menerima|kiriman|lewat|artikel|ditemukan|terotorisasi|terbaca|gagal|menyimpan|berhasil|terima|kasih|kak|halo|hai|mau|reservasi|akhir|pekan|senin|selasa|rabu|kamis|jumat|sabtu|minggu|januari|februari|maret|mei|juni|juli|agustus|jt|rb)\b/i;
// Notasi lama "Rp 145.000" / "1.5jt" (ribuan bertitik).
const OLD_PRICE = /\brp\s*\d{1,3}(\.\d{3})+\b|\d[.,]\d\s*(jt|rb)\b/i;

const outPath =
  process.argv[2] ??
  join(process.env.CLAUDE_JOB_DIR ?? "/tmp", "tmp", "visitor-copy-inventory.json");

type Row = Record<string, unknown>;
const tables: Record<string, Row[]> = {};
const flags: { table: string; id: string; field: string; snippet: string }[] = [];

for (const spec of INVENTORY_TABLES) {
  const cols = [...new Set([...spec.identity, ...spec.copy, ...(spec.arrays ?? []), ...(spec.json ?? [])])];
  const select = cols.map((c) => `"${c}"`).join(", ");
  const where = spec.slug ? ` where "slug" not like 'e2e-%'` : "";
  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `select ${select} from "${schema}"."${spec.table}"${where} order by "${spec.identity[0]}"`,
  );
  tables[spec.table] = rows;
  const keep = new Set(KEEP_AS_IS[spec.table] ?? []);
  let flagged = 0;
  for (const row of rows) {
    for (const field of [...spec.copy, ...(spec.arrays ?? []), ...(spec.json ?? [])]) {
      if (keep.has(field)) continue;
      const raw = row[field];
      const texts = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : raw ? [JSON.stringify(raw)] : [];
      for (const text of texts) {
        if (typeof text !== "string" || (!STOPWORD.test(text) && !OLD_PRICE.test(text))) continue;
        flagged++;
        flags.push({
          table: spec.table,
          id: spec.identity.map((c) => String(row[c])).join("/"),
          field,
          snippet: text.slice(0, 120),
        });
      }
    }
  }
  console.log(`${spec.table}: ${rows.length} baris, ${flagged} nilai terflag Indonesia`);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), schema, tables, flags }, null, 2),
);
console.log(`\nTotal flag: ${flags.length}. JSON: ${outPath}`);
await prisma.$disconnect();
