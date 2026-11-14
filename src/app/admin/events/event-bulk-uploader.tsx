"use client";

import { BulkPhotoUploader } from "../_components/bulk-photo-uploader";
import { addEventPhotosAction } from "../actions/events";

/**
 * Unggah banyak foto event sekaligus (diadaptasi dari uploader Gallery):
 * pra-validasi → unggah satu per satu → satu Server Action penambah foto di
 * akhir galeri event.
 */
export function EventBulkUploader({ eventId }: { eventId: string }) {
  return (
    <BulkPhotoUploader
      folder="events"
      noun="galeri event"
      hintTail="caption bisa diisi setelahnya."
      onSave={(urls) => addEventPhotosAction(eventId, urls)}
    />
  );
}