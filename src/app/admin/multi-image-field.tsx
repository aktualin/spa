"use client";

import { useId, useState } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

import { useImageRows } from "./image-rows";
import { MediaPicker } from "./media-picker";
import { ImageRowList } from "./multi-image-list";

/**
 * Field gambar banyak untuk form admin. Mengunggah ke /api/admin/upload lalu
 * menyimpan **URL-nya saja** ke hidden input `contentImages[i][imageUrl]` +
 * `[altText]`, sehingga database hanya berisi URL. Urutan daftar = urutan
 * tampil (carousel) di halaman publik.
 */
export function MultiImageField({
  label,
  folder,
  defaultImages = [],
  name = "contentImages",
}: {
  label: string;
  folder: string;
  defaultImages?: { imageUrl: string; altText: string | null }[];
  name?: string;
}) {
  const inputId = useId();
  const { rows, setRows, busy, error, setError, fileRef, addImages, handleFiles, move } =
    useImageRows(folder, defaultImages);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>
      <p className="text-xs text-neutral-500">
        Urutan pertama tampil paling awal. Bila lebih dari satu gambar, halaman
        publik menampilkannya sebagai carousel. Maksimal 12 gambar.
      </p>

      {rows.length > 0 ? (
        <ImageRowList
          rows={rows}
          name={name}
          setRows={setRows}
          move={move}
          onError={() => setError("Salah satu gambar tidak dapat dimuat.")}
        />
      ) : (
        <p className="rounded-md border border-dashed border-neutral-300 px-3 py-2 text-xs text-neutral-500">
          Belum ada gambar tambahan.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept={ALLOWED_MEDIA_TYPES.join(",")}
          multiple
          disabled={busy}
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            if (files.length > 0) void handleFiles(files);
          }}
          className="block text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
        />

        <button
          type="button"
          disabled={busy}
          onClick={() => setPickerOpen(true)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          Pilih dari Media Library
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        {busy ? "Mengunggah…" : "JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB per gambar."}
      </p>

      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          addImages([asset.url]);
          setError(null);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}