"use client";

import { inputClass, secondaryButtonClass } from "../../promos/_kit/form-ui";

export type Block = { key: string; title: string; items: string };

/** Satu blok solusi: judul + poin (satu per baris), dengan tombol urutan. */
export function SolutionBlock({
  block,
  index,
  count,
  patch,
  move,
  remove,
}: {
  block: Block;
  index: number;
  count: number;
  patch: (key: string, change: Partial<Block>) => void;
  move: (index: number, direction: -1 | 1) => void;
  remove: (key: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-md border border-neutral-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label={`Judul blok ${index + 1}`}
          name="solutionTitle"
          value={block.title}
          maxLength={200}
          onChange={(event) => patch(block.key, { title: event.target.value })}
          placeholder="Judul blok, mis. In-Office Wellness Program"
          className={`${inputClass} min-w-48 flex-1`}
        />
        <button
          type="button"
          onClick={() => move(index, -1)}
          disabled={index === 0}
          aria-label={`Naikkan blok ${index + 1}`}
          className={secondaryButtonClass}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => move(index, 1)}
          disabled={index === count - 1}
          aria-label={`Turunkan blok ${index + 1}`}
          className={secondaryButtonClass}
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => remove(block.key)}
          aria-label={`Hapus blok ${index + 1}`}
          className={`${secondaryButtonClass} text-red-700`}
        >
          Hapus
        </button>
      </div>
      <textarea
        aria-label={`Poin blok ${index + 1} (satu per baris)`}
        name="solutionItems"
        value={block.items}
        onChange={(event) => patch(block.key, { items: event.target.value })}
        rows={4}
        placeholder={"Satu poin per baris"}
        className={inputClass}
      />
    </div>
  );
}