"use client";

import { useState } from "react";

import { secondaryButtonClass } from "../../promos/_kit/form-ui";
import { StringListRow } from "./string-list-row";

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
        <StringListRow
          key={row.key}
          row={row}
          index={index}
          count={rows.length}
          name={name}
          itemLabel={itemLabel}
          placeholder={placeholder}
          onChange={(key, value) =>
            setRows((current) => current.map((r) => (r.key === key ? { ...r, value } : r)))
          }
          move={move}
          remove={(key) => setRows((current) => current.filter((r) => r.key !== key))}
        />
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