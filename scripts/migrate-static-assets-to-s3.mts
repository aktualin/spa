/**
 * Migrasi satu jalan: unggah SELURUH media statis di `public/img/` dan `public/video/` ke
 * Supabase Storage (S3-compatible) dengan key sama persis dengan path
 * relatifnya (`img/kama/…`), supaya referensi kode & database bisa memakai
 * URL publik bucket — lihat `publicUrlFor` di `src/lib/storage.ts`.
 *
 *   node scripts/migrate-static-assets-to-s3.mts
 *
 * Idempoten: PutObject menimpa objek ber-key sama, aman dijalankan ulang.
 * Video hero (`public/video/`) ikut dipindah, supaya tidak ada media situs
 * yang tersisa di `public/` (favicon tetap lokal: browser memintanya dari
 * domain situs sendiri).
 */
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const endpoint = process.env.SUPABASE_S3_ENDPOINT_URL;
const region = process.env.SUPABASE_S3_REGION;
const bucket = process.env.SUPABASE_S3_BUCKET;
const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;
const publicBase = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL?.replace(/\/$/, "");

const missing = [
  ["SUPABASE_S3_ENDPOINT_URL", endpoint],
  ["SUPABASE_S3_REGION", region],
  ["SUPABASE_S3_BUCKET", bucket],
  ["SUPABASE_S3_ACCESS_KEY_ID", accessKeyId],
  ["SUPABASE_S3_SECRET_ACCESS_KEY", secretAccessKey],
  ["NEXT_PUBLIC_SUPABASE_PUBLIC_URL", publicBase],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(`Env belum lengkap di .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const client = new S3Client({
  endpoint,
  region,
  // Nama bucket mengandung titik, jadi virtual-host style tidak bisa dipakai.
  forcePathStyle: true,
  credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
});

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const root = join(process.cwd(), "public");
const files = ["img", "video"].flatMap((dir) => walk(join(root, dir))).sort();

const failed: string[] = [];
for (const file of files) {
  const key = relative(root, file).split(sep).join("/");
  const body = readFileSync(file);

  // Satu berkas yang ditolak bucket (mis. tipe MIME tidak diizinkan) tidak
  // boleh menghentikan sisa unggahan; dilaporkan di akhir.
  try {
    await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
    console.log("✔", key, `${body.length} byte`);
  } catch (error) {
    const code = (error as { Code?: string; name?: string }).Code ?? (error as Error).name;
    console.error("✘", key, code);
    failed.push(`${key} (${code})`);
  }
}

console.log(`\n${files.length - failed.length}/${files.length} berkas diunggah.`);
if (failed.length > 0) {
  console.error(`Gagal: ${failed.join(", ")}`);
  process.exitCode = 1;
}
console.log(`Base URL publik: ${publicBase}/${bucket}/`);
