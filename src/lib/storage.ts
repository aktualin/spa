import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Supabase Storage lewat antarmuka S3-compatible. Database hanya menyimpan
 * URL publik hasil upload — file-nya sendiri tidak pernah masuk ke Postgres.
 */

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

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

export type UploadResult = { url: string; key: string };

/**
 * @param folder sub-direktori logis, mis. "treatments" atau "gallery".
 */
export async function uploadImage(
  file: File,
  folder: string,
): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error(
      `Tipe file ${file.type || "tidak dikenal"} tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.`,
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Ukuran file ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas 5 MB.`,
    );
  }

  const extension = EXTENSION_BY_TYPE[file.type] ?? "bin";
  // Nama acak: menghindari tabrakan sekaligus mencegah path traversal dari
  // nama file yang dikirim browser.
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const key = `${safeFolder}/${randomUUID()}.${extension}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: requireEnv("SUPABASE_S3_BUCKET"),
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { url: publicUrlFor(key), key };
}

/** Dipakai saat admin mengganti/menghapus gambar agar bucket tidak menumpuk sampah. */
export async function deleteImageByUrl(url: string): Promise<void> {
  const base = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLIC_URL").replace(/\/$/, "");
  const prefix = `${base}/${requireEnv("SUPABASE_S3_BUCKET")}/`;
  if (!url.startsWith(prefix)) return; // bukan file kita, abaikan

  await getClient().send(
    new DeleteObjectCommand({
      Bucket: requireEnv("SUPABASE_S3_BUCKET"),
      Key: url.slice(prefix.length),
    }),
  );
}
