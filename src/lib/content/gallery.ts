/**
 * Bacaan publik galeri foto (modul 3).
 *
 * Album published + foto urut `sortOrder` (urutan sama dengan admin). Album
 * draf tidak pernah tampil. Tabel kosong, semua album draf, atau DB tidak
 * terbaca → daftar kosong (empty state di halaman), bukan foto contoh.
 */
import { cacheLife, cacheTag } from "next/cache";

import { safeQueryWithMeta } from "@/lib/safe-query";

import { CONTENT_TAGS } from "./tags";

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
  altText: string | null;
  sortOrder: number;
};

export type GalleryAlbum = {
  slug: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  photos: GalleryPhoto[];
};

function mapAlbum(row: {
  slug: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  photos: {
    id: string;
    imageUrl: string;
    caption: string | null;
    altText: string | null;
    sortOrder: number;
  }[];
}): GalleryAlbum {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    coverUrl: row.coverUrl,
    // Sort stabil: urutan sekunder dari query (createdAt, id) tetap terjaga.
    photos: [...row.photos].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

/** Semua album galeri yang published. */
export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  "use cache";
  cacheTag(CONTENT_TAGS.gallery);

  const { data, usedFallback } = await safeQueryWithMeta(async () => {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.galleryAlbum.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        photos: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        },
      },
    });
    return rows.map(mapAlbum);
  }, []);

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Satu album + fotonya (urut sortOrder). */
export async function getGalleryAlbum(slug: string): Promise<GalleryAlbum | null> {
  const albums = await getGalleryAlbums();
  return albums.find((a) => a.slug === slug) ?? null;
}
