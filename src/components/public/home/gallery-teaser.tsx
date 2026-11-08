import Link from "next/link";
import { cacheLife } from "next/cache";
import { ArrowRight, Instagram } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { getGalleryAlbums } from "@/lib/content/gallery";
import { photoAltText } from "@/lib/domain/gallery";
import { site as staticSite } from "@/data/content";
import { getSiteSettings } from "@/lib/content/site";

type InstagramPost = {
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
async function getInstagramFeed(): Promise<InstagramPost[]> {
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

/**
 * Section "Gallery Teaser" — foto galeri + link Instagram. Feed Instagram
 * live dipakai bila token tersedia; kalau tidak, foto galeri yang tampil.
 */
export async function GalleryTeaserSection() {
  const [albums, settings, instagramPosts] = await Promise.all([
    getGalleryAlbums(),
    getSiteSettings(),
    getInstagramFeed(),
  ]);

  // Urutan album & foto mengikuti admin; `caption` di sini dipakai sebagai alt.
  const galleryPhotos = albums
    .flatMap((album) =>
      album.photos.map((photo) => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        caption: photoAltText(photo, album.name),
      })),
    )
    .slice(0, 12);

  const instagramUrl = settings.instagramUrl || staticSite.instagram;
  const items: { id: string; imageUrl: string; caption: string | null; href: string }[] =
    instagramPosts.length > 0
      ? instagramPosts.map((post) => ({
          id: post.id,
          imageUrl: post.mediaUrl,
          caption: post.caption,
          href: post.permalink ?? instagramUrl,
        }))
      : galleryPhotos.map((photo) => ({
          id: photo.id,
          imageUrl: photo.imageUrl,
          caption: photo.caption,
          href: instagramUrl,
        }));

  if (items.length === 0) return null;

  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <div className="flex flex-col items-start gap-4 border-b border-cocoa/15 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body text-cocoa/70 transition-colors hover:text-cocoa"
            >
              @{settings.instagramUsername}
            </a>
            <a
              href="https://www.instagram.com/explore/search/keyword/?q=%23kamaspa"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-title-sm"
            >
              #kamaspa
            </a>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[0.9375rem] underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Follow Us
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
          {items.map((item, index) => (
            <li key={item.id} className="group relative aspect-square overflow-hidden bg-cream">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram post ${index + 1}`}
                className="absolute inset-0 z-10"
              />
              <img
                src={item.imageUrl}
                alt={item.caption ?? ""}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cocoa/0 opacity-0 transition-opacity duration-300 group-hover:bg-cocoa/40 group-hover:opacity-100">
                <Instagram className="h-6 w-6 text-white" />
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/gallery" className="btn btn-outline border-cocoa/40">
            Lihat Galeri Lengkap
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
