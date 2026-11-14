"use client";

import { useId } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

import { useReplaceFile } from "./media-replace-hook";

/** Form ganti berkas; alur unggah + pemindahan ada di useReplaceFile. */
export function ReplaceFileForm({
  id,
  folder,
  usageCount,
}: {
  id: string;
  folder: string;
  usageCount: number;
}) {
  const inputId = useId();
  const { fileRef, busy, error, message, handleFile } = useReplaceFile(
    id,
    folder,
    usageCount,
  );

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
        Ganti berkas
      </label>
      <input
        id={inputId}
        ref={fileRef}
        type="file"
        accept={ALLOWED_MEDIA_TYPES.join(",")}
        disabled={busy !== null}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
        className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
      />
      <p className="text-xs text-neutral-500">
        {busy ??
          "JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB. Berkas baru mendapat alamat baru; semua konten yang memakai berkas ini ikut diperbarui."}
      </p>
      {message ? (
        <p role="status" className="text-xs text-green-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}