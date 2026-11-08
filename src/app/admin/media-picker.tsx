"use client";

import { useEffect, useId, useRef, useState } from "react";

import { listMediaForPicker, listMediaFolders, type PickerAsset } from "./actions/media";

export type PickedMedia = {
  id: string;
  url: string;
  fileName: string;
  altText: string | null;
};

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
  const [folders, setFolders] = useState<string[]>([]);
  const [assets, setAssets] = useState<PickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sinkronkan <dialog> native dengan prop `open`.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listMediaFolders()
      .then((rows) => {
        if (!cancelled) setFolders(rows.map((row) => row.folder));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Muat ulang daftar saat filter berubah (pencarian ditunda sejenak).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      listMediaForPicker({ folder: folder || undefined, q: q || undefined })
        .then((rows) => {
          if (!cancelled) setAssets(rows);
        })
        .catch(() => {
          if (!cancelled) setError("Gagal memuat Media Library.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, q ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, folder, q]);

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

        <div className="flex flex-wrap gap-3 border-b border-neutral-200 px-4 py-3">
          <select
            aria-label="Filter folder"
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          >
            <option value="">Semua folder</option>
            {folders.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="search"
            aria-label="Cari berkas"
            placeholder="Cari nama, judul, atau alt text…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            // Dialog ini biasanya berada di dalam <form> konten: Enter jangan
            // sampai mengirim form tersebut.
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            className="min-w-48 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
        </div>

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
            <ul className={`grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 ${loading ? "opacity-60" : ""}`}>
              {assets.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    title={asset.title || asset.fileName}
                    onClick={() =>
                      onSelect({
                        id: asset.id,
                        url: asset.url,
                        fileName: asset.fileName,
                        altText: asset.altText,
                      })
                    }
                    className="group block w-full overflow-hidden rounded-md border border-neutral-200 text-left hover:border-neutral-900 focus:border-neutral-900 focus:outline-none"
                  >
                    <span className="block aspect-square bg-neutral-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.altText ?? ""}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </span>
                    <span className="block truncate px-1.5 py-1 text-[11px] text-neutral-700">
                      {asset.title || asset.fileName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  );
}
