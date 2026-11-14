"use client";

import { useId, useState } from "react";

import { ImageFieldControls } from "./image-field-parts";
import { useInlineImageUpload } from "./image-upload";
import { MediaPicker } from "./media-picker";

/**
 * Field gambar untuk form admin. Mengunggah ke /api/admin/upload lalu menyimpan
 * **URL-nya saja** ke hidden input, sehingga database hanya berisi URL.
 * Gambar yang sudah ada bisa dipilih ulang lewat "Pilih dari Media Library".
 */
export function ImageField({
  name,
  label,
  folder,
  defaultValue = "",
}: {
  name: string;
  label: string;
  folder: string;
  defaultValue?: string;
}) {
  const inputId = useId();
  const [url, setUrl] = useState(defaultValue);
  const { fileRef, busy, error, setError, uploadImage } = useInlineImageUpload(folder, setUrl);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>

      {/* Nilai yang benar-benar dikirim ke Server Action. */}
      <input type="hidden" name={name} value={url} />

      <div className="flex items-start gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          {url ? (
            // Sumbernya URL eksternal arbitrer dari Supabase Storage, jadi
            // dipakai <img> biasa alih-alih next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="size-full object-cover"
              onError={() => setError("Gambar tidak dapat dimuat.")}
            />
          ) : (
            <span className="text-[10px] text-neutral-400">kosong</span>
          )}
        </div>

        <ImageFieldControls
          inputId={inputId}
          fileRef={fileRef}
          busy={busy}
          url={url}
          error={error}
          onFile={(file) => void uploadImage(file)}
          onOpenPicker={() => setPickerOpen(true)}
          onClear={() => setUrl("")}
        />
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          setUrl(asset.url);
          setError(null);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}