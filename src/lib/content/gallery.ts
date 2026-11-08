/**
 * Bacaan publik galeri foto (modul 3).
 *
 * Album published + foto urut `sortOrder` (urutan sama dengan admin). Album
 * draf tidak pernah tampil. Tabel album benar-benar kosong (belum diisi) atau
 * DB down → album statis "KAMA Spa" berisi foto yang sudah ada di
 * `public/img/kama`. Bila admin sudah punya album tetapi semuanya draf,
 * hasilnya kosong — fallback tidak menimpa keputusan admin.
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

/** Fallback statis: album "KAMA Spa" dari foto yang sudah ada di repo. */
function staticAlbums(): GalleryAlbum[] {
  const files = [
    "01-incense.jpg",
    "02-bottle-shadows.jpg",
    "03-oil-bowl.jpg",
    "04-turmeric-scrub.jpg",
    "05-foot-bath.jpg",
    "06-bride.jpg",
    "07-flower-bowl.jpg",
    "08-water-drop.jpg",
    "09-leaf-drop.jpg",
  ];
  return [
    {
      slug: "kama-spa",
      name: "KAMA Spa",
      description:
        "Ruang tenang KAMA Spa di South Jakarta — aroma, cahaya, dan tangan therapist kami.",
      coverUrl: "/img/kama/01-incense.jpg",
      photos: files.map((file, index) => ({
        id: `static-${index}`,
        imageUrl: `/img/kama/${file}`,
        caption: null,
        altText: `Suasana KAMA Spa — ${file.replace(/\.jpg$/, "").replace(/^\d+-/, "").replace(/-/g, " ")}`,
        sortOrder: index,
      })),
    },
  ];
}

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
    if (rows.length === 0 && (await prisma.galleryAlbum.count()) === 0) {
      throw new Error("belum ada album galeri");
    }
    return rows.map(mapAlbum);
  }, staticAlbums());

  if (usedFallback) cacheLife("minutes");
  else cacheLife("hours");
  return data;
}

/** Satu album + fotonya (urut sortOrder). */
export async function getGalleryAlbum(slug: string): Promise<GalleryAlbum | null> {
  const albums = await getGalleryAlbums();
  return albums.find((a) => a.slug === slug) ?? null;
}
