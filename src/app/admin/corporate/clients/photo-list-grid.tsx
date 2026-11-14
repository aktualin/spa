"use client";

import { secondaryButtonClass } from "../../promos/_kit/form-ui";

/** Grid foto dokumentasi klien dengan tombol urutan dan lepas. */
export function PhotoGrid({
  urls,
  move,
  remove,
}: {
  urls: string[];
  move: (index: number, direction: -1 | 1) => void;
  remove: (url: string) => void;
}) {
  if (urls.length === 0) {
    return <p className="text-sm text-neutral-500">Belum ada foto.</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {urls.map((url, index) => (
        <li key={url} className="space-y-1.5 rounded-md border border-neutral-200 p-2">
          <div className="aspect-[3/4] overflow-hidden rounded bg-neutral-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Foto ${index + 1}`} className="size-full object-cover" />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-auto text-xs text-neutral-500">#{index + 1}</span>
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label={`Naikkan foto ${index + 1}`}
              className={secondaryButtonClass}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === urls.length - 1}
              aria-label={`Turunkan foto ${index + 1}`}
              className={secondaryButtonClass}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label={`Lepas foto ${index + 1}`}
              className={`${secondaryButtonClass} text-red-700`}
            >
              Lepas
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}