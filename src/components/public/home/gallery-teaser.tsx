import Link from "next/link";
import { fillCopy } from "@/components/copy-text";
import { ArrowRight } from "@/components/icons";
import { InstagramGrid } from "@/components/instagram-grid";
import { Reveal } from "@/components/reveal";
import { getGalleryAlbums } from "@/lib/content/gallery";
import type { HomepageSection } from "@/lib/content/homepage";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import { isSafeCtaHref } from "@/lib/domain/homepage-banner";
import { getSiteSettings } from "@/lib/content/site";
import { GalleryTeaserHeader } from "./gallery-teaser-header";
import { getInstagramFeed, resolveTeaserItems } from "./instagram-feed";

/**
 * Section "Gallery Teaser" — foto galeri + link Instagram. Feed Instagram
 * live dipakai bila token tersedia; kalau tidak, foto galeri yang tampil.
 */
export async function GalleryTeaserSection({
  section,
  copyBlocks,
}: {
  section?: HomepageSection | null;
  copyBlocks: PageCopy;
}) {
  const [albums, settings, instagramPosts] = await Promise.all([
    getGalleryAlbums(),
    getSiteSettings(),
    getInstagramFeed(),
  ]);

  const instagramUrl = settings.instagramUrl || null;
  const hashtag = copy(copyBlocks, "global.instagram_hashtag");
  const hashtagHref = copy(copyBlocks, "global.instagram_hashtag_href");
  const followLabel = copy(copyBlocks, "global.instagram_follow_label");
  const galleryCtaLabel = section?.ctaLabel?.trim() || copy(copyBlocks, "global.gallery_cta_label");
  const galleryCtaHrefRaw = section?.ctaHref?.trim() || "";
  const galleryCtaHref =
    galleryCtaLabel && galleryCtaHrefRaw && isSafeCtaHref(galleryCtaHrefRaw)
      ? galleryCtaHrefRaw
      : "";
  const items = resolveTeaserItems(albums, instagramPosts, instagramUrl);

  if (items.length === 0) return null;

  const postAria =
    copy(copyBlocks, "global.socials_post_aria") || "Instagram post {n}";

  return (
    <Reveal as="section" className="bg-cream">
      <div className="container-kama py-14 md:py-16 lg:py-20">
        <GalleryTeaserHeader
          instagramUrl={instagramUrl}
          instagramUsername={settings.instagramUsername}
          hashtag={hashtag}
          hashtagHref={hashtagHref}
          followLabel={followLabel}
        />

        <InstagramGrid
          items={items.map((item, index) => ({
            key: item.id,
            src: item.imageUrl,
            alt: item.caption ?? "",
            href: item.href,
            label: fillCopy(postAria, { n: index + 1 }),
          }))}
        />

        {galleryCtaHref ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={galleryCtaHref} className="btn btn-outline border-cocoa/40">
              {galleryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}