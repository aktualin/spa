import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONTENT_ROLES } from "@/lib/domain/roles";

import { StatusBanners } from "../../promos/_kit/list-ui";
import { PhotoManager } from "../photo-manager";

export const instant = false;

export default async function GalleryAlbumPhotosPage({
  params,
  searchParams,
}: {
  params: Promise<{ albumId: string }>;
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole(CONTENT_ROLES);

  const [{ albumId }, query] = await Promise.all([params, searchParams]);

  const album = await prisma.galleryAlbum.findUnique({
    where: { id: albumId },
    include: {
      // Urutan sama dengan getGalleryAlbums (halaman publik).
      photos: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }] },
    },
  });
  if (!album) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/gallery" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar album
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{album.name}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            /{album.slug} · {album.photos.length} foto
          </p>
        </div>
        <Link
          href={`/admin/gallery/albums/${album.id}`}
          className="text-sm text-neutral-700 underline"
        >
          Ubah data album
        </Link>
      </div>

      <StatusBanners
        saved={query.saved}
        deleted={query.deleted}
        deletedLabel="Foto dihapus."
      />

      <div className="mt-6">
        <PhotoManager
          albumId={album.id}
          photos={album.photos.map((photo) => ({
            id: photo.id,
            imageUrl: photo.imageUrl,
            caption: photo.caption ?? "",
            altText: photo.altText ?? "",
            sortOrder: photo.sortOrder,
          }))}
        />
      </div>
    </div>
  );
}
