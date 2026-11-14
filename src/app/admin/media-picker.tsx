"use client";

import { useEffect, useId, useRef, useState } from "react";

import { usePickerAssets } from "./media-picker-data";
import { PickerFilters, PickerGrid, type PickedMedia } from "./media-picker-parts";

export type { PickedMedia } from "./media-picker-parts";

/**
 * Dialog modal "Pilih dari Media Library". Memuat daftar aset lewat Server
 * Action bacaan; klik satu gambar untuk memilihnya.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: PickedMedia) => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [folder, setFolder] = useState("");
  const [q, setQ] = useState("");
  const { folders, assets, loading, error } = usePickerAssets(open, folder, q);

  // Sinkronkan <dialog> native dengan prop `open`.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Klik di latar (backdrop) menutup dialog.
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-lg border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-neutral-900">
            Pilih dari Media Library
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            Tutup
          </button>
        </div>

        <PickerFilters folder={folder} setFolder={setFolder} q={q} setQ={setQ} folders={folders} />

        <div className="min-h-48 flex-1 overflow-y-auto p-4">
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : loading && assets.length === 0 ? (
            <p className="text-sm text-neutral-500">Memuat…</p>
          ) : assets.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Tidak ada berkas. Unggah gambar di halaman Media Library atau lewat field gambar.
            </p>
          ) : (
            <PickerGrid assets={assets} loading={loading} onSelect={onSelect} />
          )}
        </div>
      </div>
    </dialog>
  );
}