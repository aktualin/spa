"use client";

import { useState } from "react";

import { inputClass, secondaryButtonClass } from "../../promos/_kit/form-ui";

/**
 * Editor daftar teks satu baris (benefit, fitur program, item In-Spa).
 * Setiap baris dikirim sebagai `name` berulang; baris kosong diabaikan server.
 * Urutan baris = urutan tampil (↑/↓).
 */
export function StringListField({
  name,
  legend,
  hint,
  itemLabel,
  placeholder,
  defaultValue,
  max,
}: {
  name: string;
  legend: string;
  hint?: string;
  itemLabel: string;
  placeholder?: string;
  defaultValue: string[];
  max: number;
}) {
  // Kunci stabil per baris supaya input tidak tertukar saat baris dipindah.
  const [rows, setRows] = useState(() =>
    (defaultValue.length > 0 ? defaultValue : [""]).map((value, index) => ({
      key: `r${index}`,
      value,
    })),
  );
  const [counter, setCounter] = useState(rows.length);

  function move(index: number, direction: -1 | 1) {
    setRows((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-neutral-700">{legend}</legend>
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}

      {rows.map((row, index) => (
        <div key={row.key} className="flex flex-wrap gap-2">
          <input
            aria-label={`${itemLabel} baris ${index + 1}`}
            name={name}
            value={row.value}
            maxLength={200}
            onChange={(event) =>
              setRows((current) =>
                current.map((r) => (r.key === row.key ? { ...r, value: event.target.value } : r)),
              )
            }
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
            disabled={index === rows.length - 1}
            aria-label={`Turunkan ${itemLabel} baris ${index + 1}`}
            className={secondaryButtonClass}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
            aria-label={`Hapus ${itemLabel} baris ${index + 1}`}
            className={`${secondaryButtonClass} text-red-700`}
          >
            Hapus
          </button>
        </div>
      ))}

      <button
        type="button"
        disabled={rows.length >= max}
        onClick={() => {
          setRows((current) => [...current, { key: `n${counter}`, value: "" }]);
          setCounter((c) => c + 1);
        }}
        className={secondaryButtonClass}
      >
        + Tambah {itemLabel}
      </button>
    </fieldset>
  );
}
