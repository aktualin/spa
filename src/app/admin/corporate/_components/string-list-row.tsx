"use client";

import { inputClass, secondaryButtonClass } from "../../promos/_kit/form-ui";

/** Satu baris daftar teks: input + tombol naik/turun/hapus. */
export function StringListRow({
  row,
  index,
  count,
  name,
  itemLabel,
  placeholder,
  onChange,
  move,
  remove,
}: {
  row: { key: string; value: string };
  index: number;
  count: number;
  name: string;
  itemLabel: string;
  placeholder?: string;
  onChange: (key: string, value: string) => void;
  move: (index: number, direction: -1 | 1) => void;
  remove: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        aria-label={`${itemLabel} baris ${index + 1}`}
        name={name}
        value={row.value}
        maxLength={200}
        onChange={(event) => onChange(row.key, event.target.value)}
        placeholder={placeholder}
        className={`${inputClass} min-w-48 flex-1`}
      />
      <button
        type="button"
        onClick={() => move(index, -1)}
        disabled={index === 0}
        aria-label={`Naikkan ${itemLabel} baris ${index + 1}`}
        className={secondaryButtonClass}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => move(index, 1)}
        disabled={index === count - 1}
        aria-label={`Turunkan ${itemLabel} baris ${index + 1}`}
        className={secondaryButtonClass}
      >
        ↓
      </button>
      <button
        type="button"
        onClick={() => remove(row.key)}
        aria-label={`Hapus ${itemLabel} baris ${index + 1}`}
        className={`${secondaryButtonClass} text-red-700`}
      >
        Hapus
      </button>
    </div>
  );
}