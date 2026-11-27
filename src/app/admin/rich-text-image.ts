"use client";

/**
 * Posisi gambar ala Google Docs untuk editor teks kaya: teks mengalir di
 * kiri/kanan gambar (float) atau gambar satu blok di atas/bawah teks.
 * Class-nya berasal dari `rich-text-layout` (domain) supaya sanitizer dan
 * CSS publik memakai nama yang sama.
 */
import {
  IMAGE_PLACEMENT_CLASSES,
  type ImagePlacement,
} from "@/lib/domain/rich-text-layout";

/** Cari `<img>` yang sedang dipilih/diklik di editor contentEditable. */
export function findSelectedImage(editor: HTMLElement | null): HTMLImageElement | null {
  if (!editor) return null;
  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);

  // Klik pada gambar: kursor tepat di node img atau di depannya (offset).
  const { startContainer, startOffset } = range;
  if (startContainer instanceof HTMLImageElement) return startContainer;
  const child = startContainer.childNodes?.[startOffset];
  if (child instanceof HTMLImageElement) return child;

  // Seleksi rentang yang memuat tepat satu gambar.
  if (!range.collapsed) {
    const root = range.commonAncestorContainer;
    const element = root instanceof Element ? root : root.parentElement;
    const images = element?.querySelectorAll("img") ?? [];
    if (images.length === 1 && range.intersectsNode(images[0])) return images[0];
  }
  return null;
}

/**
 * Pasang class posisi pada gambar terpilih; "block" menghapus semua class
 * posisi. Mengembalikan false bila tidak ada gambar yang dipilih.
 */
export function applyImagePlacement(editor: HTMLElement | null, placement: ImagePlacement): boolean {
  const image = findSelectedImage(editor);
  if (!image) return false;
  image.classList.remove(...Object.values(IMAGE_PLACEMENT_CLASSES));
  if (placement !== "block") image.classList.add(IMAGE_PLACEMENT_CLASSES[placement]);
  return true;
}

/** Pasang posisi + beri tahu bila belum ada gambar terpilih, lalu sinkronkan editor. */
export function placeSelectedImage(
  editor: HTMLElement | null,
  placement: ImagePlacement,
  sync: () => void,
): void {
  if (!applyImagePlacement(editor, placement)) {
    window.alert("Click the image you want to position first.");
    return;
  }
  sync();
}
