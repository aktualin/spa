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

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/gallery", {});
}

export default async function GalleryPage() {
  const [albums, pageCopy] = await Promise.all([getGalleryAlbums(), getPageCopy()]);
  const withPhotos = albums.filter((album) => album.photos.length > 0);
  // Microcopy galeri dari CB; placeholder {n}/{m} diganti di komponen client.
  const galleryLabels = {
    altFallback: copy(pageCopy, "gallery.alt_fallback") || "KAMA Spa gallery photo",
    gridAria: copy(pageCopy, "gallery.grid_aria") || "Open photo {n} of {m}",
    lightboxPrev: copy(pageCopy, "gallery.lightbox_prev") || "Previous photo",
    lightboxNext: copy(pageCopy, "gallery.lightbox_next") || "Next photo",
    lightboxClose: copy(pageCopy, "gallery.lightbox_close") || "Close preview",
    lightboxCounter: copy(pageCopy, "gallery.lightbox_counter") || "{n} / {m}",
  };

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
                {/* Deskripsi album = HTML dari editor (dirender RichText di
                    dalam header): gambar bisa di kiri/kanan teks atau blok. */}
                <PublicSectionHeader
                  eyebrow={`${album.photos.length} ${copy(pageCopy, "gallery.photo_count_suffix")}`}
                  title={album.name}
                  description={album.description || undefined}
                />
                <div className="mt-8">
                  <GalleryGrid
                    photos={album.photos.map((photo) => ({
                      imageUrl: photo.imageUrl,
                      caption: photo.caption,
                      // Alt kosong → caption → nama album.
                      altText: photoAltText(photo, album.name),
                    }))}
                    labels={galleryLabels}
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
