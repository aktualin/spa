import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import {
  ALLOWED_MEDIA_TYPES,
  MAX_MEDIA_BYTES,
  type MediaMimeType,
  sanitizeFileName,
  validateMediaBytes,
} from "@/lib/domain/media";

/**
 * Supabase Storage lewat antarmuka S3-compatible. Database hanya menyimpan
 * URL publik hasil upload — file-nya sendiri tidak pernah masuk ke Postgres.
 */

export { ALLOWED_MEDIA_TYPES as ALLOWED_IMAGE_TYPES, MAX_MEDIA_BYTES as MAX_IMAGE_BYTES };

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

export type UploadResult = {
  url: string;
  key: string;
  fileName: string;
  mimeType: MediaMimeType;
  sizeBytes: number;
};

/**
 * Validasi (tipe, ukuran, nama, dan isi berkas) lalu unggah ke storage.
 * Tidak mencatat ke Media Library — lihat `storeMedia` di `@/lib/media`.
 *
 * @param folder sub-direktori logis, mis. "treatments" atau "gallery".
 */
export async function uploadImage(
  file: File,
  folder: string,
): Promise<UploadResult> {
  const body = Buffer.from(await file.arrayBuffer());
  const mimeType = validateMediaBytes(
    { name: file.name, type: file.type, size: file.size },
    body.subarray(0, 16),
  );

  const fileName = sanitizeFileName(file.name, mimeType);
  // Nama dari browser hanya dipakai setelah dirapikan (tanpa path traversal);
  // potongan acak menghindari tabrakan nama.
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const key = `${safeFolder}/${randomUUID().slice(0, 8)}-${fileName}`;

  await putObject(key, body, mimeType);

  return { url: publicUrlFor(key), key, fileName, mimeType, sizeBytes: file.size };
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

/**
 * Dipanggil form konten saat gambar diganti/dihapus agar bucket tidak
 * menumpuk sampah. Berkas yang tercatat di Media Library TIDAK dihapus:
 * bisa dipakai konten lain, dan hanya dihapus dari halaman Media Library.
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  const inLibrary = await prisma.mediaAsset.findUnique({
    where: { url },
    select: { id: true },
  });
  if (inLibrary) return;

  await deleteStoredObject(url);
}
