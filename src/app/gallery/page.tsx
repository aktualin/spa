import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import {
  PublicEmptyState,
  PublicPageHeader,
  PublicSectionHeader,
} from "@/components/public/page-parts";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { getGalleryAlbums } from "@/lib/content/gallery";
import { copy, getPageCopy } from "@/lib/content/page-copy";
import { photoAltText } from "@/lib/domain/gallery";
import { withPageSeo } from "@/lib/content/seo";
import { toPlainText } from "@/lib/domain/rich-text";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/gallery", {});
}

export default async function GalleryPage() {
  const [albums, pageCopy] = await Promise.all([getGalleryAlbums(), getPageCopy()]);
  const withPhotos = albums.filter((album) => album.photos.length > 0);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow={copy(pageCopy, "gallery.hero.eyebrow")}
          title={copy(pageCopy, "gallery.hero.title")}
          description={copy(pageCopy, "gallery.hero.description")}
        />

        {withPhotos.length === 0 ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <PublicEmptyState
                title={copy(pageCopy, "gallery.empty_title")}
                description={copy(pageCopy, "gallery.empty_description")}
              />
            </div>
          </Reveal>
        ) : (
          withPhotos.map((album, index) => (
            <Reveal
              key={album.slug}
              as="section"
              id={album.slug}
              className={index % 2 === 0 ? "bg-cream" : "bg-cream-soft"}
            >
              <div className="container-kama py-14 md:py-16 lg:py-20">
                <PublicSectionHeader
                  eyebrow={`${album.photos.length} ${copy(pageCopy, "gallery.photo_count_suffix")}`}
                  title={album.name}
                  description={toPlainText(album.description) || undefined}
                />
                <div className="mt-8">
                  <GalleryGrid
                    photos={album.photos.map((photo) => ({
                      imageUrl: photo.imageUrl,
                      caption: photo.caption,
                      // Alt kosong → caption → nama album.
                      altText: photoAltText(photo, album.name),
                    }))}
                  />
                </div>
              </div>
            </Reveal>
          ))
        )}
      </main>
      <Footer />
    </>
  );
}
