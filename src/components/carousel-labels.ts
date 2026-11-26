/**
 * Aria carousel gambar dari ContentBlock (carousel.aria_*). Dipakai halaman
 * server yang merender `ImageCarousel`; blok kosong jatuh ke teks bawaan.
 * Counter memakai placeholder {n}/{m} yang diganti saat render.
 */
import type { CarouselLabels } from "@/components/image-carousel";
import { copy, type PageCopy } from "@/lib/content/page-copy";

export function carouselLabels(blocks: PageCopy): CarouselLabels {
  return {
    prev: copy(blocks, "carousel.aria_prev") || "Previous image",
    next: copy(blocks, "carousel.aria_next") || "Next image",
    counter: copy(blocks, "carousel.aria_counter") || "Image {n} of {m}",
  };
}