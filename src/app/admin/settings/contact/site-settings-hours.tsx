"use client";

import { useRef, useState } from "react";

import { inputClass } from "../_components/form-ui";

const smallButton =
  "rounded-md border border-neutral-300 px-2.5 text-sm text-neutral-600 hover:bg-neutral-50 disabled:opacity-40";

/** Daftar baris jam operasional: tambah, hapus, dan ubah urutan. */
export function OpeningHoursField({ initial, max }: { initial: string[]; max: number }) {
  const nextId = useRef(0);
  const makeRow = (value: string) => ({ id: nextId.current++, value });
  const [rows, setRows] = useState(() =>
    (initial.length > 0 ? initial : [""]).map(makeRow),
  );

  const move = (index: number, delta: -1 | 1) =>
    setRows((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-neutral-700">
        Jam operasional
      </legend>
      <p className="text-xs text-neutral-500">
        Satu baris per jadwal, contoh: <em>Mon – Sun. 10 AM – 8 PM</em>. Baris
        kosong diabaikan; minimal satu baris.
      </p>
      {rows.map((row, index) => (
        <div key={row.id} className="flex flex-wrap gap-2">
          <input
            aria-label={`Jam operasional baris ${index + 1}`}
            name={`openingHours[${index}]`}
            value={row.value}
            maxLength={120}
            onChange={(event) =>
              setRows((current) =>
                current.map((item) =>
                  item.id === row.id ? { ...item, value: event.target.value } : item,
                ),
              )
            }
            className={`${inputClass} min-w-56 flex-1`}
          />
          <button
            type="button"
            aria-label={`Naikkan baris ${index + 1}`}
            disabled={index === 0}
            onClick={() => move(index, -1)}
            className={smallButton}
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Turunkan baris ${index + 1}`}
            disabled={index === rows.length - 1}
            onClick={() => move(index, 1)}
            className={smallButton}
          >
            ↓
          </button>
          <button
            type="button"
            disabled={rows.length === 1}
            onClick={() =>
              setRows((current) => current.filter((item) => item.id !== row.id))
            }
            className={`${smallButton} px-3`}
          >
            Hapus
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={rows.length >= max}
        onClick={() => setRows((current) => [...current, makeRow("")])}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
      >
        + Tambah baris
      </button>
    </fieldset>
  );
}