"use server";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { PickerAsset } from "./media.types";

/** Bacaan untuk dialog "Pilih dari Media Library". */
export async function listMediaForPicker(
  filter: { folder?: string; q?: string } = {},
): Promise<PickerAsset[]> {
  await requireSession();

  const folder = filter.folder?.trim();
  const q = filter.q?.trim().slice(0, 100);
  return prisma.mediaAsset.findMany({
    where: {
      ...(folder ? { folder } : {}),
      ...(q
        ? {
            OR: [
              { fileName: { contains: q, mode: "insensitive" as const } },
              { title: { contains: q, mode: "insensitive" as const } },
              { altText: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ folder: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      url: true,
      fileName: true,
      title: true,
      altText: true,
      folder: true,
      mimeType: true,
    },
  });
}