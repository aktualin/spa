/**
 * Menulis ulang URL publik bucket lama di SELURUH kolom teks database menjadi
 * bucket aktif (SUPABASE_S3_BUCKET). Bucket lama default `kama`; arah sebaliknya
 * (mis. vip-book → kama) lewat `--from=<bucket>`. Hanya nilai ber-prefix base
 * lama yang disentuh — konten lain tidak berubah. Pastikan objeknya sudah ada
 * di bucket target sebelum menjalankan.
 *
 *   node scripts/migrate-db-urls-bucket.mts --dry-run                # pratinjau
 *   node scripts/migrate-db-urls-bucket.mts                          # tulis
 *   node scripts/migrate-db-urls-bucket.mts --from=vip-book --dry-run
 *
 * Idempoten: sesudah dijalankan tidak ada lagi nilai ber-base lama, jadi
 * jalanan ulang tidak mengubah apa pun.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env", quiet: true });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const publicBase = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL?.replace(/\/$/, "");
const bucket = process.env.SUPABASE_S3_BUCKET;
const fromFlag = process.argv.find((a) => a.startsWith("--from="));
const OLD_BUCKET = fromFlag ? fromFlag.slice("--from=".length) : "kama";

if (!connectionString) {
  console.error("DATABASE_URL belum diset di .env");
  process.exit(1);
}
if (!publicBase || !bucket) {
  console.error("NEXT_PUBLIC_SUPABASE_PUBLIC_URL / SUPABASE_S3_BUCKET belum diset");
  process.exit(1);
}
if (bucket === OLD_BUCKET) {
  console.error(`SUPABASE_S3_BUCKET masih "${OLD_BUCKET}" — tidak ada yang ditulis ulang.`);
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const schema = process.env.DATABASE_SCHEMA || "public";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema }) });
const oldBase = `${publicBase}/${OLD_BUCKET}`;
const newBase = `${publicBase}/${bucket}`;

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
  if (dryRun) {
    const where =
      type === "ARRAY"
        ? `exists (select 1 from unnest(${col}) x where x like $1 || '/%')`
        : `${col} like $1 || '/%' or strpos(${col}, $1 || '/') > 0`;
    const [row] = await prisma.$queryRawUnsafe<Array<{ n: number }>>(
      `select count(*)::int as n from ${target} where ${where}`,
      oldBase,
    );
    if (row.n > 0) console.log(`[dry-run] ${table}.${column}: ${row.n} baris akan berubah`);
    total += row.n;
    continue;
  }
  const changed =
    type === "ARRAY"
      ? // Kolom text[] (mis. photoUrls): tulis ulang tiap elemen ber-base lama.
        await prisma.$executeRawUnsafe(
          `update ${target}
              set ${col} = array(select case when x like $1 || '/%' then $2 || substring(x from length($1) + 1) else x end
                                   from unnest(${col}) with ordinality as u(x, i) order by i)
            where exists (select 1 from unnest(${col}) x where x like $1 || '/%')`,
          oldBase,
          newBase,
        )
      : // Nilai URL utuh dan URL di dalam HTML (src="…", src='…', dll.).
        await prisma.$executeRawUnsafe(
          `update ${target}
              set ${col} = case when ${col} like $1 || '/%'
                                then $2 || substring(${col} from length($1) + 1)
                                else replace(${col}, $1 || '/', $2 || '/') end
            where ${col} like $1 || '/%' or strpos(${col}, $1 || '/') > 0`,
          oldBase,
          newBase,
        );
  if (changed > 0) {
    console.log(`✔ ${table}.${column}: ${changed} baris`);
    total += changed;
  }
}

console.log(
  total > 0
    ? dryRun
      ? `\n[dry-run] ${total} URL akan ditulis ulang ke ${newBase}/….`
      : `\n${total} URL kini menunjuk ${newBase}/….`
    : `Tidak ada URL ber-base ${oldBase} di database — sudah bersih.`,
);

await prisma.$disconnect();
