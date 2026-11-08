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
import { withPageSeo } from "@/lib/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/gallery", {
    title: "Gallery",
    description:
      "Foto ruang, ritual, dan detail kecil di KAMA Spa — supaya Anda tahu seperti apa suasananya sebelum datang.",
  });
}

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();
  const withPhotos = albums.filter((album) => album.photos.length > 0);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <PublicPageHeader
          eyebrow="Gallery"
          title="Suasana, sebelum Anda datang."
          description="Ruang rawat, bahan yang kami pakai, dan detail yang membuat kunjungan terasa tenang."
        />

        {withPhotos.length === 0 ? (
          <Reveal as="section" className="bg-cream">
            <div className="container-kama py-14 md:py-16 lg:py-20">
              <PublicEmptyState
                title="Belum ada foto"
                description="Album akan muncul di sini begitu foto diunggah dari dashboard admin."
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
                  eyebrow={`${album.photos.length} foto`}
                  title={album.name}
                  description={album.description ?? undefined}
                />
                <div className="mt-8">
                  <GalleryGrid
                    photos={album.photos.map((photo) => ({
                      imageUrl: photo.imageUrl,
                      caption: photo.caption,
                      altText: photo.altText,
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
