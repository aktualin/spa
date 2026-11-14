/** Klien S3 Supabase Storage & operasi objek — lihat `storage.ts`. */
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diset di .env.local`);
  return value;
}

let client: S3Client | undefined;

function getClient(): S3Client {
  if (client) return client;

  client = new S3Client({
    endpoint: requireEnv("SUPABASE_S3_ENDPOINT_URL"),
    region: requireEnv("SUPABASE_S3_REGION"),
    // Nama bucket mengandung titik, jadi virtual-host style tidak bisa dipakai.
    forcePathStyle: true,
    credentials: {
      accessKeyId: requireEnv("SUPABASE_S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("SUPABASE_S3_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

export function publicUrlFor(key: string): string {
  const base = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLIC_URL").replace(/\/$/, "");
  return `${base}/${requireEnv("SUPABASE_S3_BUCKET")}/${key}`;
}

/** Tulis (atau timpa) satu objek di bucket. */
export async function putObject(key: string, body: Buffer, contentType: string) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: requireEnv("SUPABASE_S3_BUCKET"),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

/** Key storage dari URL publik; null bila URL bukan berkas bucket kita. */
export function storageKeyFromUrl(url: string): string | null {
  const base = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLIC_URL").replace(/\/$/, "");
  const prefix = `${base}/${requireEnv("SUPABASE_S3_BUCKET")}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

/** Hapus objek di bucket tanpa pemeriksaan apa pun (dipakai Media Library). */
export async function deleteStoredObject(url: string): Promise<void> {
  const key = storageKeyFromUrl(url);
  if (!key) return; // bukan file kita, abaikan

  await getClient().send(
    new DeleteObjectCommand({ Bucket: requireEnv("SUPABASE_S3_BUCKET"), Key: key }),
  );
}