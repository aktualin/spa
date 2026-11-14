/** Pemilihan slide yang dirender hero — lihat `hero-slide.ts`. */
import { isSafeImageUrl } from "./homepage-banner.ts";
import type {
  HeroSlideRowLike,
  HeroSlideSectionLike,
  HeroSlideView,
} from "./hero-slide.types.ts";
import { isSafeVideoUrl, normalizeMediaType } from "./hero-slide.url.ts";
import { clean } from "./text.ts";

function toView(row: HeroSlideRowLike): HeroSlideView | null {
  const mediaType = normalizeMediaType(row.mediaType);
  if (!mediaType || !row.isPublished) return null;

  const imageUrl = clean(row.imageUrl);
  if (!isSafeImageUrl(imageUrl)) return null;

  const videoUrl = clean(row.videoUrl);
  if (mediaType === "VIDEO" && !isSafeVideoUrl(videoUrl)) return null;

  const mobileImageUrl = clean(row.mobileImageUrl);

  return {
    key: row.id,
    mediaType,
    imageUrl,
    mobileImageUrl:
      mediaType === "IMAGE" && mobileImageUrl && isSafeImageUrl(mobileImageUrl)
        ? mobileImageUrl
        : null,
    videoUrl: mediaType === "VIDEO" ? videoUrl : null,
    imageAlt: clean(row.imageAlt),
  };
}

/**
 * Slide yang dirender hero. Urutan: `sortOrder` naik (stabil). Tabel kosong →
 * satu slide fallback dari gambar section (bila aman).
 */
export function resolveHeroSlides(
  rows: HeroSlideRowLike[],
  section?: HeroSlideSectionLike | null,
): HeroSlideView[] {
  if (rows.length === 0) {
    const imageUrl = clean(section?.imageUrl);
    if (!isSafeImageUrl(imageUrl)) return [];
    const mobileImageUrl = clean(section?.mobileImageUrl);
    return [
      {
        key: "hero-fallback",
        mediaType: "IMAGE",
        imageUrl,
        mobileImageUrl:
          mobileImageUrl && isSafeImageUrl(mobileImageUrl) ? mobileImageUrl : null,
        videoUrl: null,
        imageAlt: clean(section?.imageAlt),
      },
    ];
  }

  return rows
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        a.row.sortOrder - b.row.sortOrder || a.index - b.index,
    )
    .map(({ row }) => toView(row))
    .filter((view): view is HeroSlideView => view !== null);
}