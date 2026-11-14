/**
 * Migrasi satu jalan: salin SELURUH objek dari bucket lama `kama` ke bucket
 * `vip-book` (target = SUPABASE_S3_BUCKET) dengan key yang sama persis, supaya
 * URL publik cukup ganti base — lihat scripts/migrate-db-image-urls-to-s3.mts
 * untuk penulisan ulang URL di database.
 *
 *   node scripts/migrate-bucket-kama-to-vip-book.mts
 *
 * Idempoten: CopyObject menimpa objek ber-key sama, aman dijalankan ulang.
 * Bucket lama TIDAK dihapus — verifikasi dulu sebelum memutuskan membersihkannya.
 */
import { CopyObjectCommand, HeadObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const SOURCE_BUCKET = "kama";
const bucket = process.env.SUPABASE_S3_BUCKET;

if (!bucket) {
  console.error("SUPABASE_S3_BUCKET belum diset di .env.local");
  process.exit(1);
}
if (bucket === SOURCE_BUCKET) {
  console.error(`SUPABASE_S3_BUCKET masih "${SOURCE_BUCKET}" — tidak ada yang disalin.`);
  process.exit(1);
}

const client = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT_URL,
  region: process.env.SUPABASE_S3_REGION,
  // Nama bucket mengandung titik, jadi virtual-host style tidak bisa dipakai.
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
});

async function listKeys(name: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({ Bucket: name, ContinuationToken: token }),
    );
    keys.push(...(page.Contents ?? []).map((o) => o.Key!));
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return keys.sort();
}

const sourceKeys = (await listKeys(SOURCE_BUCKET)).filter(
  (k) => !k.endsWith(".emptyFolderPlaceholder"),
);

const failed: string[] = [];
for (const key of sourceKeys) {
  try {
    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: key,
        CopySource: encodeURI(`${SOURCE_BUCKET}/${key}`),
      }),
    );
    console.log("✔", key);
  } catch (error) {
    const code = (error as { Code?: string; name?: string }).Code ?? (error as Error).name;
    console.error("✘", key, code);
    failed.push(`${key} (${code})`);
  }
}

// Cross-check: setiap key sumber harus ada di target dengan ukuran sama.
const targetKeys = new Set(await listKeys(bucket));
const missing = sourceKeys.filter((k) => !targetKeys.has(k));
for (const key of missing) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  } catch {
    failed.push(key);
  }
}

console.log(`\n${sourceKeys.length - failed.length}/${sourceKeys.length} objek tersalin ke ${bucket}.`);
if (failed.length > 0) {
  console.error(`Gagal: ${failed.join(", ")}`);
  process.exitCode = 1;
}
