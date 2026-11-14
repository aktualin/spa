"use client";

import type { RefObject } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

import { secondaryButtonClass } from "../../promos/_kit/form-ui";

/** Input unggah massal + tombol Media Library + progress/galat. */
export function PhotoListControls({
  inputId,
  fileRef,
  busy,
  full,
  max,
  progress,
  errors,
  onFiles,
  onOpenPicker,
}: {
  inputId: string;
  fileRef: RefObject<HTMLInputElement | null>;
  busy: boolean;
  full: boolean;
  max: number;
  progress: string | null;
  errors: string[];
  onFiles: (files: FileList) => void;
  onOpenPicker: () => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm text-neutral-700">
        Unggah beberapa foto sekaligus
      </label>
      <input
        id={inputId}
        ref={fileRef}
        type="file"
        multiple
        accept={ALLOWED_MEDIA_TYPES.join(",")}
        disabled={busy || full}
        onChange={(event) => {
          const files = event.target.files;
          if (files) onFiles(files);
        }}
        className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
      />
      <button
        type="button"
        disabled={busy || full}
        onClick={onOpenPicker}
        className={secondaryButtonClass}
      >
        Pilih dari Media Library
      </button>
      <p className="text-xs text-neutral-500">
        JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB per file dan {max} foto per klien.
        &quot;Lepas&quot; hanya melepas foto dari klien ini — berkasnya tetap ada di Media
        Library. Perubahan tersimpan setelah menekan Simpan.
      </p>
      {progress ? (
        <p role="status" className="text-sm text-blue-700">
          {progress}
        </p>
      ) : null}
      {errors.length > 0 ? (
        <ul role="alert" className="space-y-0.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {errors.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}