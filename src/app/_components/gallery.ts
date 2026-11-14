import type { CarouselImage } from "@/components/image-carousel";

/**
 * Gambar utama selalu jadi slide pertama; galeri admin menyusul. Satu
 * gambar dirender <img> biasa, lebih dari satu jadi carousel.
 */
export function buildGallery(
  mainImage: string | null | undefined,
  galleryImages: CarouselImage[],
): CarouselImage[] {
  return [
    ...(mainImage ? [{ imageUrl: mainImage, altText: null }] : []),
    ...galleryImages,
  ];
}