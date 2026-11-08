import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { AlbumForm, type AlbumFormData } from "../album-form";

export const instant = false;

export default async function GalleryAlbumFormPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const { albumId } = await params;
  const isNew = albumId === "new";

  let data: AlbumFormData;

  if (isNew) {
    // Album baru diletakkan di urutan paling akhir.
    const last = await prisma.galleryAlbum.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    data = {
      id: null,
      slug: "",
      name: "",
      description: "",
      coverUrl: "",
      isPublished: true,
      sortOrder: last ? last.sortOrder + 1 : 0,
    };
  } else {
    const album = await prisma.galleryAlbum.findUnique({
      where: { id: albumId },
    });
    if (!album) notFound();

    data = {
      id: album.id,
      slug: album.slug,
      name: album.name,
      description: album.description ?? "",
      coverUrl: album.coverUrl ?? "",
      isPublished: album.isPublished,
      sortOrder: album.sortOrder,
    };
  }

  return <AlbumForm album={data} />;
}
