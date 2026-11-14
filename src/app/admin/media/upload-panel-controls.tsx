"use client";

import type { RefObject } from "react";

import { ALLOWED_MEDIA_TYPES } from "@/lib/domain/media";

import { inputClass } from "../promos/_kit/form-ui";
import { NEW_FOLDER } from "./upload-panel-xhr";

/** Pilihan folder tujuan (termasuk folder baru) + input berkas gambar. */
export function UploadControls({
  folderId,
  fileId,
  fileRef,
  options,
  folderChoice,
  setFolderChoice,
  newFolder,
  setNewFolder,
  targetFolder,
  busy,
  onFiles,
}: {
  folderId: string;
  fileId: string;
  fileRef: RefObject<HTMLInputElement | null>;
  options: string[];
  folderChoice: string;
  setFolderChoice: (value: string) => void;
  newFolder: string;
  setNewFolder: (value: string) => void;
  targetFolder: string;
  busy: boolean;
  onFiles: (files: FileList) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label htmlFor={folderId} className="block text-sm font-medium text-neutral-700">
          Folder tujuan
        </label>
        <select
          id={folderId}
          value={folderChoice}
          disabled={busy}
          onChange={(event) => setFolderChoice(event.target.value)}
          className={inputClass}
        >
          {options.map((folder) => (
            <option key={folder} value={folder}>
              {folder}
            </option>
          ))}
          <option value={NEW_FOLDER}>+ Folder baru…</option>
        </select>
        {folderChoice === NEW_FOLDER ? (
          <input
            aria-label="Nama folder baru"
            value={newFolder}
            disabled={busy}
            onChange={(event) => setNewFolder(event.target.value)}
            placeholder="mis. interior"
            className={inputClass}
          />
        ) : null}
        <p className="text-xs text-neutral-500">
          Nama folder hanya huruf kecil, angka, dan tanda hubung.
          {folderChoice === NEW_FOLDER && targetFolder ? ` Disimpan sebagai “${targetFolder}”.` : ""}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={fileId} className="block text-sm font-medium text-neutral-700">
          Berkas gambar
        </label>
        <input
          id={fileId}
          ref={fileRef}
          type="file"
          multiple
          accept={ALLOWED_MEDIA_TYPES.join(",")}
          disabled={busy || (folderChoice === NEW_FOLDER && !targetFolder)}
          onChange={(event) => {
            if (event.target.files) onFiles(event.target.files);
          }}
          className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-neutral-700 disabled:opacity-60"
        />
        <p className="text-xs text-neutral-500">
          Boleh memilih beberapa berkas sekaligus. JPG, PNG, WebP, AVIF, atau GIF. Maksimal 4 MB per berkas.
        </p>
      </div>
    </div>
  );
}