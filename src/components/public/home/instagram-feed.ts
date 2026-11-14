import { cacheLife } from "next/cache";

import { photoAltText } from "@/lib/domain/gallery";
import type { GalleryAlbum } from "@/lib/content/gallery";

export type InstagramPost = {
  id: string;
  mediaUrl: string;
  caption: string | null;
  permalink: string | null;
};

/**
 * Feed Instagram live — hanya diambil bila `INSTAGRAM_ACCESS_TOKEN` diset.
 * Fetch dibungkus `"use cache"` + `cacheLife("minutes")` supaya aman untuk
 * prerender. Gagal load → fallback ke foto galeri.
 */
export async function getInstagramFeed(): Promise<InstagramPost[]> {
  "use cache";
  cacheLife("minutes");

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  const userId = process.env.INSTAGRAM_USER_ID ?? "me";
  const url = new URL(
    `https://graph.instagram.com/${userId}/media`,
  );
  url.searchParams.set("fields", "id,caption,media_url,permalink");
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "8");

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const payload: unknown = await response.json();
    const data =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: unknown }).data
        : null;
    if (!Array.isArray(data)) return [];

    return data
      .filter(
        (item): item is { id: string; media_url?: string; caption?: string; permalink?: string } =>
          !!item &&
          typeof item === "object" &&
          typeof (item as { id?: unknown }).id === "string" &&
          typeof (item as { media_url?: unknown }).media_url === "string",
      )
      .map((item) => ({
        id: item.id,
        mediaUrl: item.media_url as string,
        caption: item.caption ?? null,
        permalink: item.permalink ?? null,
      }));
  } catch {
    return [];
  }
}

export type TeaserItem = { id: string; imageUrl: string; caption: string | null; href: string | null };

/**
 * Foto teaser: feed Instagram live bila ada; kalau tidak, foto galeri
 * (maks 12, urutan mengikuti admin; `caption` dipakai sebagai alt).
 */
export function resolveTeaserItems(
  albums: GalleryAlbum[],
  instagramPosts: InstagramPost[],
  instagramUrl: string | null,
): TeaserItem[] {
  if (instagramPosts.length > 0) {
    return instagramPosts.map((post) => ({
      id: post.id,
      imageUrl: post.mediaUrl,
      caption: post.caption,
      href: post.permalink ?? instagramUrl,
    }));
  }
  return albums
    .flatMap((album) =>
      album.photos.map((photo) => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        caption: photoAltText(photo, album.name),
      })),
    )
    .slice(0, 12)
    .map((photo) => ({
      id: photo.id,
      imageUrl: photo.imageUrl,
      caption: photo.caption,
      href: instagramUrl,
    }));
}