"use client";

import { useState } from "react";

import { inputClass } from "../promos/_kit/form-ui";
import type { OptionRow } from "./treatment-form.types";

/** Fieldset Durasi & Harga: baris opsi yang bisa ditambah/dihapus. */
export function OptionsFieldset({ initial }: { initial: OptionRow[] }) {
  const [options, setOptions] = useState<OptionRow[]>(
    initial.length > 0 ? initial : [{ label: "", durationMin: "", priceIdr: "" }],
  );

  function updateOption(index: number, patch: Partial<OptionRow>) {
    setOptions((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-neutral-700">
        Durasi &amp; Harga
      </legend>
      <p className="text-xs text-neutral-500">
        Harga dalam rupiah penuh tanpa titik, contoh: 145000. Kosongkan
        seluruh baris untuk menghapusnya.
      </p>

      {options.map((option, index) => (
        <div key={index} className="flex flex-wrap gap-2">
          <input
            aria-label={`Label durasi baris ${index + 1}`}
            name={`options[${index}][label]`}
            value={option.label}
            onChange={(e) => updateOption(index, { label: e.target.value })}
            placeholder="60 min"
            className={`${inputClass} min-w-28 flex-1`}
          />
          <input
            aria-label={`Menit baris ${index + 1}`}
            name={`options[${index}][durationMin]`}
            value={option.durationMin}
            onChange={(e) =>
              updateOption(index, { durationMin: e.target.value })
            }
            inputMode="numeric"
            placeholder="60"
            className={`${inputClass} w-24`}
          />
          <input
            aria-label={`Harga baris ${index + 1}`}
            name={`options[${index}][priceIdr]`}
            value={option.priceIdr}
            onChange={(e) =>
              updateOption(index, { priceIdr: e.target.value })
            }
            inputMode="numeric"
            placeholder="145000"
            className={`${inputClass} w-32`}
          />
          <button
            type="button"
            onClick={() =>
              setOptions((rows) => rows.filter((_, i) => i !== index))
            }
            className="rounded-md border border-neutral-300 px-3 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Hapus
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setOptions((rows) => [
            ...rows,
            { label: "", durationMin: "", priceIdr: "" },
          ])
        }
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        + Tambah durasi
      </button>
    </fieldset>
  );
}