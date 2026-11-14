"use client";

import type { Dispatch, SetStateAction } from "react";

import type { ImageRow } from "./image-rows";
import { ImageRowItem } from "./multi-image-field-parts";

/** Daftar baris gambar; urutan daftar = urutan tampil di halaman publik. */
export function ImageRowList({
  rows,
  name,
  setRows,
  move,
  onError,
}: {
  rows: ImageRow[];
  name: string;
  setRows: Dispatch<SetStateAction<ImageRow[]>>;
  move: (index: number, direction: "up" | "down") => void;
  onError: () => void;
}) {
  return (
    <ul className="space-y-2">
      {rows.map((row, index) => (
        <ImageRowItem
          key={row.key}
          row={row}
          index={index}
          name={name}
          total={rows.length}
          onAltChange={(value) =>
            setRows((current) =>
              current.map((r) => (r.key === row.key ? { ...r, altText: value } : r)),
            )
          }
          onMove={(direction) => move(index, direction)}
          onRemove={() => setRows((current) => current.filter((r) => r.key !== row.key))}
          onError={onError}
        />
      ))}
    </ul>
  );
}