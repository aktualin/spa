export type CarouselImage = { imageUrl: string; altText: string | null };

/** Aria carousel dari CB (carousel.aria_*); counter memakai {n}/{m}. */
export type CarouselLabels = { prev: string; next: string; counter: string };

export type ImageCarouselProps = {
  images: CarouselImage[];
  /** Alt fallback untuk gambar yang tidak punya altText sendiri. */
  alt: string;
  /** Kelas pembungkus carousel (tidak dipakai untuk mode satu gambar). */
  className?: string;
  /** Kelas tiap <img>, mis. "image-cover" agar menyatu dengan CSS halaman. */
  imageClassName?: string;
  eager?: boolean;
  /** Aria panah & dot; dibaca dari CB di halaman server. */
  labels?: CarouselLabels;
};