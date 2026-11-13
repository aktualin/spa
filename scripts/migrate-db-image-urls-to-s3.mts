/**
 * Migrasi satu jalan: menulis ulang URL media lokal (`/img/…`, `/video/…`) di SELURUH
 * kolom teks database menjadi URL publik Supabase Storage. Hanya nilai
 * ber-prefix lokal yang disentuh — konten lain tidak berubah.
 *
 *   node scripts/migrate-db-image-urls-to-s3.mts
 *
 * Idempoten: sesudah dijalankan tidak ada lagi nilai ber-prefix `/img/` atau `/video/`,
 * jadi jalanan ulang tidak mengubah apa pun.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const connectionString = process.env.DATABASE_URL;
const publicBase = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL?.replace(/\/$/, "");
const bucket = process.env.SUPABASE_S3_BUCKET;

if (!connectionString) {
  console.error("DATABASE_URL belum diset di .env.local");
  process.exit(1);
}
if (!publicBase || !bucket) {
  console.error("NEXT_PUBLIC_SUPABASE_PUBLIC_URL / SUPABASE_S3_BUCKET belum diset");
  process.exit(1);
}

const schema = process.env.DATABASE_SCHEMA || "public";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema }) });
const base = `${publicBase}/${bucket}`;

const columns = await prisma.$queryRawUnsafe<
  Array<{ table_name: string; column_name: string; data_type: string }>
>(
  `select table_name, column_name, data_type
     from information_schema.columns
    where table_schema = $1
      and (data_type in ('text', 'character varying') or udt_name = '_text')`,
  schema,
);

// Pengaman: schema ini harus benar-benar schema KAMA (sudah dimigrasi), bukan
// schema aplikasi lain yang kebetulan berbagi database.
if (!columns.some((c) => c.table_name === "Treatment")) {
  console.error(`Schema "${schema}" tidak berisi tabel KAMA (Treatment). Dibatalkan.`);
  process.exit(1);
}

let total = 0;
for (const { table_name: table, column_name: column, data_type: type } of columns) {
  // Nama tabel/kolom berasal dari information_schema (identifier sah),
  // tetap dikutip ganda agar aman.
  const target = `"${schema}"."${table}"`;
  const col = `"${column}"`;
  const changed =
    type === "ARRAY"
      ? // Kolom text[] (mis. photoUrls): tulis ulang tiap elemen ber-prefix lokal.
        await prisma.$executeRawUnsafe(
          `update ${target}
              set ${col} = array(select case when x like '/img/%' or x like '/video/%' then $1 || x else x end
                                   from unnest(${col}) with ordinality as u(x, i) order by i)
            where exists (select 1 from unnest(${col}) x where x like '/img/%' or x like '/video/%')`,
          base,
        )
      : // Nilai URL utuh (`/img/…`) dan gambar di dalam HTML (`src="/img/…"`).
        await prisma.$executeRawUnsafe(
          `update ${target}
              set ${col} = case when ${col} like '/img/%' or ${col} like '/video/%'
                                then $1 || ${col}
                                else replace(replace(${col}, '"/img/', '"' || $1 || '/img/'),
                                             '"/video/', '"' || $1 || '/video/') end
            where ${col} like '/img/%' or ${col} like '/video/%'
               or strpos(${col}, '"/img/') > 0 or strpos(${col}, '"/video/') > 0`,
          base,
        );
  if (changed > 0) {
    console.log(`✔ ${table}.${column}: ${changed} baris`);
    total += changed;
  }
}

console.log(
  total > 0
    ? `\n${total} URL gambar kini menunjuk S3 (${base}/…).`
    : "Tidak ada URL lokal `/img/…`/`/video/…` di database — sudah bersih.",
);

await prisma.$disconnect();
