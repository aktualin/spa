"use client";

import type { ImageRow } from "./image-rows";

/** Satu baris gambar: hidden input, pratinjau, alt text, dan tombol urutan. */
export function ImageRowItem({
  row,
  index,
  name,
  total,
  onAltChange,
  onMove,
  onRemove,
  onError,
}: {
  row: ImageRow;
  index: number;
  name: string;
  total: number;
  onAltChange: (value: string) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
  onError: () => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-md border border-neutral-200 p-2">
      {/* Nilai yang benar-benar dikirim ke Server Action. */}
      <input type="hidden" name={`${name}[${index}][imageUrl]`} value={row.imageUrl} />
      <input type="hidden" name={`${name}[${index}][altText]`} value={row.altText} />

      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
        {/* Sumbernya URL eksternal arbitrer dari Supabase Storage, jadi
            dipakai <img> biasa alih-alih next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={row.imageUrl}
          alt=""
          className="size-full object-cover"
          onError={onError}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <input
          aria-label={`Teks alt gambar ${index + 1}`}
          value={row.altText}
          maxLength={160}
          placeholder="Teks alt (opsional)"
          onChange={(event) => onAltChange(event.target.value)}
          className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-neutral-900"
        />

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            aria-label={`Naikkan gambar ${index + 1}`}
            disabled={index === 0}
            onClick={() => onMove("up")}
            className="rounded border border-neutral-300 px-2 py-0.5 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Turunkan gambar ${index + 1}`}
            disabled={index === total - 1}
            onClick={() => onMove("down")}
            className="rounded border border-neutral-300 px-2 py-0.5 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-red-700 hover:underline"
          >
            Hapus
          </button>
        </div>
      </div>
    </li>
  );
}