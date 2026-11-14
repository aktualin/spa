"use server";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { MediaListItem } from "./media.types";
import { usageByUrl, usageOf } from "./media.usage";

/** Dipakai halaman /admin/media. Urutan: folder, sortOrder naik, terbaru dulu. */
export async function listMedia(filter: {
  folder?: string;
  q?: string;
  unused?: boolean;
}): Promise<MediaListItem[]> {
  await requireSession();

  const q = filter.q?.trim();
  const assets = await prisma.mediaAsset.findMany({
    where: {
      ...(filter.folder ? { folder: filter.folder } : {}),
      ...(q
        ? {
            OR: [
              { fileName: { contains: q, mode: "insensitive" as const } },
              { title: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ folder: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      url: true,
      fileName: true,
      title: true,
      altText: true,
      mimeType: true,
      sizeBytes: true,
      folder: true,
      sortOrder: true,
      createdAt: true,
    },
  });

  const usage = await usageByUrl(assets.map((asset) => asset.url));
  const items = assets.map((asset) => ({
    ...asset,
    usageCount: usage.get(asset.url)?.length ?? 0,
  }));
  return filter.unused ? items.filter((item) => item.usageCount === 0) : items;
}

/** Daftar folder beserta jumlah berkasnya. */
export async function listMediaFolders(): Promise<{ folder: string; count: number }[]> {
  await requireSession();

  const groups = await prisma.mediaAsset.groupBy({
    by: ["folder"],
    _count: { _all: true },
    orderBy: { folder: "asc" },
  });
  return groups.map((group) => ({ folder: group.folder, count: group._count._all }));
}

/** Satu aset beserta daftar "Dipakai di". Dipakai halaman detail. */
export async function getMediaDetail(id: string) {
  await requireSession();

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: { uploadedBy: { select: { name: true, email: true } } },
  });
  if (!asset) return null;

  return { asset, usages: await usageOf(asset.url) };
}