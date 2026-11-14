"use server";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { mimeTypeFromFileName, splitStorageKey } from "@/lib/domain/media";
import { CONTENT_ROLES } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { storageKeyFromUrl } from "@/lib/storage";

import { bucketPrefix } from "./media.describe";
import { collectContentUrls } from "./media.rewrite";
import { revalidateMediaPages } from "./media.usage";

async function contentLength(url: string): Promise<number> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const length = Number(response.headers.get("content-length"));
    return response.ok && Number.isFinite(length) && length > 0 ? Math.round(length) : 0;
  } catch {
    return 0;
  }
}

/**
 * Catat ke Media Library semua berkas bucket kita yang sudah dipakai konten
 * (diunggah sebelum Media Library ada) tetapi belum punya baris MediaAsset.
 * Idempoten: URL/key yang sudah tercatat dilewati.
 */
export async function syncMediaAction(): Promise<void> {
  await requireRole(CONTENT_ROLES);

  const found = await collectContentUrls(bucketPrefix());

  const candidates = [...found]
    .map((url) => ({ url, key: storageKeyFromUrl(url) }))
    .filter((item): item is { url: string; key: string } => Boolean(item.key));

  const existing = await prisma.mediaAsset.findMany({
    where: {
      OR: [
        { url: { in: candidates.map((item) => item.url) } },
        { storageKey: { in: candidates.map((item) => item.key) } },
      ],
    },
    select: { url: true, storageKey: true },
  });
  const known = new Set(existing.flatMap((row) => [row.url, row.storageKey]));
  const missing = candidates.filter((item) => !known.has(item.url) && !known.has(item.key));

  let created = 0;
  if (missing.length > 0) {
    const maxima = await prisma.mediaAsset.groupBy({ by: ["folder"], _max: { sortOrder: true } });
    const nextOrder = new Map(maxima.map((row) => [row.folder, (row._max.sortOrder ?? -1) + 1]));

    // HEAD paralel dalam kelompok kecil supaya tidak membanjiri storage.
    const sizes: number[] = [];
    for (let i = 0; i < missing.length; i += 5) {
      sizes.push(...(await Promise.all(missing.slice(i, i + 5).map((item) => contentLength(item.url)))));
    }

    const data = missing.map((item, index) => {
      const { folder, fileName } = splitStorageKey(item.key);
      const sortOrder = nextOrder.get(folder) ?? 0;
      nextOrder.set(folder, sortOrder + 1);
      return {
        url: item.url,
        storageKey: item.key,
        fileName,
        mimeType: mimeTypeFromFileName(fileName) ?? "application/octet-stream",
        sizeBytes: sizes[index] ?? 0,
        folder,
        sortOrder,
        // Pengunggah aslinya tidak diketahui.
        uploadedById: null,
      };
    });

    const result = await prisma.mediaAsset.createMany({ data, skipDuplicates: true });
    created = result.count;
  }

  revalidateMediaPages();
  redirect(`/admin/media?synced=${created}`);
}