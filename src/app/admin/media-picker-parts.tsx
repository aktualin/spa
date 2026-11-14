"use client";

import type { PickerAsset } from "./actions/media";

export type PickedMedia = {
  id: string;
  url: string;
  fileName: string;
  altText: string | null;
};

export function PickerFilters({
  folder,
  setFolder,
  q,
  setQ,
  folders,
}: {
  folder: string;
  setFolder: (value: string) => void;
  q: string;
  setQ: (value: string) => void;
  folders: string[];
}) {
  return (
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
  );
}

export function PickerGrid({
  assets,
  loading,
  onSelect,
}: {
  assets: PickerAsset[];
  loading: boolean;
  onSelect: (asset: PickedMedia) => void;
}) {
  return (
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
  );
}