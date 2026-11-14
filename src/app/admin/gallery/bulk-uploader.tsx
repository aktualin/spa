"use client";

import { BulkPhotoUploader } from "../_components/bulk-photo-uploader";
import { addPhotosAction } from "../actions/gallery";

/**
 * Unggah banyak foto sekaligus ke album gallery (pra-validasi → unggah satu
 * per satu → satu Server Action penambah foto di akhir album).
 */
export function BulkUploader({ albumId }: { albumId: string }) {
  return (
    <BulkPhotoUploader
      folder="gallery"
      noun="album"
      hintTail="caption & alt text bisa diisi setelahnya."
      onSave={(urls) => addPhotosAction(albumId, urls)}
    />
  );
}