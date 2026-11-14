"use client";

import type { RefObject } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

/** Kontrol field gambar: input berkas, tombol Media Library, URL, dan galat. */
export function ImageFieldControls({
  inputId,
  fileRef,
  busy,
  url,
  error,
  onFile,
  onOpenPicker,
  onClear,
}: {
  inputId: string;
  fileRef: RefObject<HTMLInputElement | null>;
  busy: boolean;
  url: string;
  error: string | null;
  onFile: (file: File) => void;
  onOpenPicker: () => void;
  onClear: () => void;
}) {
  return (
    <div className="min-w-0 flex-1 space-y-2">
      <input
        id={inputId}
        ref={fileRef}
        type="file"
        accept={ALLOWED_MEDIA_TYPES.join(",")}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
        className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
      />

      <button
        type="button"
        disabled={busy}
        onClick={onOpenPicker}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
      >
        Pilih dari Media Library
      </button>

      <p className="text-xs text-neutral-500">
        {busy ? "Mengunggah…" : "JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB."}
      </p>

      {url ? (
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-xs text-neutral-500">
            {url}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs text-red-700 hover:underline"
          >
            Hapus
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}