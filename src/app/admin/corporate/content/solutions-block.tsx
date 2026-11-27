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
          aria-label={`Block ${index + 1} title`}
          name="solutionTitle"
          value={block.title}
          maxLength={200}
          onChange={(event) => patch(block.key, { title: event.target.value })}
          placeholder="Block title, e.g. In-Office Wellness Program"
          className={`${inputClass} min-w-48 flex-1`}
        />
        <button
          type="button"
          onClick={() => move(index, -1)}
          disabled={index === 0}
          aria-label={`Move block ${index + 1} up`}
          className={secondaryButtonClass}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => move(index, 1)}
          disabled={index === count - 1}
          aria-label={`Move block ${index + 1} down`}
          className={secondaryButtonClass}
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => remove(block.key)}
          aria-label={`Delete block ${index + 1}`}
          className={`${secondaryButtonClass} text-red-700`}
        >
          Delete
        </button>
      </div>
      <textarea
        aria-label={`Block ${index + 1} points (one per line)`}
        name="solutionItems"
        value={block.items}
        onChange={(event) => patch(block.key, { items: event.target.value })}
        rows={4}
        placeholder={"One point per line"}
        className={inputClass}
      />
    </div>
  );
}