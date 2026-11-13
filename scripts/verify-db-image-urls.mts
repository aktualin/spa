/**
 * Cek korelasi database ↔ bucket S3: setiap URL gambar yang tersimpan di
 * database harus menunjuk ke bucket kita DAN objeknya benar-benar ada.
 *
 *   node scripts/verify-db-image-urls.mts
 *
 * Menyapu semua kolom teks/varchar (dan text[]) skema public, mengambil nilai
 * yang terlihat seperti URL/path gambar, lalu melaporkan:
 *   - masih path lokal (`/img/…`)      → jalankan migrate-db-image-urls-to-s3
 *   - URL di luar bucket kita          → perlu diperbaiki / dipindah ke bucket
 *   - URL bucket tapi objeknya hilang  → unggah ulang / perbaiki datanya
 * Exit code 1 bila ada temuan apa pun. Hanya membaca; tidak mengubah apa pun.
 */
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const bucket = process.env.SUPABASE_S3_BUCKET!;
const base = `${process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL!.replace(/\/$/, "")}/${bucket}/`;
const schema = process.env.DATABASE_SCHEMA || "public";
// Koneksi langsung (DIRECT_URL, session mode): satu query besar lebih andal
// daripada puluhan query kecil lewat transaction pooler.
const prisma = new PrismaClient({
  adapter: new PrismaPg(
    { connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! },
    { schema },
  ),
});
const s3 = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT_URL,
  region: process.env.SUPABASE_S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
});

const IMAGE = /\.(jpe?g|png|webp|avif|gif|svg|pdf|mp4|webm)(\?.*)?$/i;

const columns = await prisma.$queryRawUnsafe<
  Array<{ table_name: string; column_name: string; data_type: string }>
>(
  `select table_name, column_name, data_type from information_schema.columns
    where table_schema = $1
      and (data_type in ('text', 'character varying') or udt_name = '_text')`,
  schema,
);

const local: string[] = [];
const foreign: string[] = [];
const missing: string[] = [];
const checked = new Map<string, boolean>();

// Semua nilai teks dari semua kolom dalam SATU query (UNION ALL).
const selects = columns.map(({ table_name: t, column_name: c, data_type }) => {
  const expr = data_type === "ARRAY" ? `unnest("${c}")` : `"${c}"`;
  return `select '${t}.${c}' as loc, ${expr} as v from "${schema}"."${t}" where "${c}" is not null`;
});
const values = selects.length
  ? await prisma.$queryRawUnsafe<Array<{ loc: string; v: string | null }>>(
      `select distinct loc, v from (${selects.join("\nunion all\n")}) all_values`,
    )
  : [];

for (const { loc, v } of values) {
  if (!v || !IMAGE.test(v)) continue;
  const where = `${loc}: ${v}`;
  if (v.startsWith("/")) local.push(where);
  else if (!v.startsWith(base)) foreign.push(where);
  else {
    const key = decodeURIComponent(v.slice(base.length).split("?")[0]);
    if (!checked.has(key)) {
      const ok = await s3
        .send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
        .then(() => true, () => false);
      checked.set(key, ok);
    }
    if (!checked.get(key)) missing.push(where);
  }
}

const report = (label: string, list: string[]) => {
  console.log(`${list.length === 0 ? "✔" : "✘"} ${label}: ${list.length}`);
  for (const line of list.slice(0, 30)) console.log(`    ${line}`);
};
console.log(`Objek bucket yang dirujuk database: ${checked.size}`);
report("Masih path lokal (/img/…, /video/…)", local);
report("URL di luar bucket", foreign);
report("Objek tidak ada di bucket", missing);

await prisma.$disconnect();
if (local.length + foreign.length + missing.length > 0) process.exitCode = 1;
