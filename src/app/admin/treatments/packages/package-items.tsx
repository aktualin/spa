"use client";

import { useState } from "react";

import { inputClass } from "../../promos/_kit/form-ui";
import type { PackageItemRow, TreatmentOption } from "./package-form.types";

/** Fieldset "Isi package": baris treatment/label bebas yang bisa diurutkan. */
export function ItemsFieldset({
  initial,
  treatments,
}: {
  initial: PackageItemRow[];
  treatments: TreatmentOption[];
}) {
  const [items, setItems] = useState<PackageItemRow[]>(
    initial.length > 0 ? initial : [{ treatmentId: "", label: "", minutes: "" }],
  );

  function updateItem(index: number, patch: Partial<PackageItemRow>) {
    setItems((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-neutral-700">
        Isi package
      </legend>
      <p className="text-xs text-neutral-500">
        Pilih treatment dari daftar (boleh lintas kategori) atau tulis label
        bebas. Urutan baris mengikuti urutan tampil.
      </p>

      {items.map((item, index) => (
        <div key={index} className="flex flex-wrap gap-2">
          <select
            aria-label={`Treatment baris ${index + 1}`}
            name={`items[${index}][treatmentId]`}
            value={item.treatmentId}
            onChange={(e) =>
              updateItem(index, { treatmentId: e.target.value })
            }
            className={`${inputClass} min-w-48 flex-1`}
          >
            <option value="">— label bebas —</option>
            {treatments.map((treatment) => (
              <option key={treatment.id} value={treatment.id}>
                {treatment.categoryName} · {treatment.name}
              </option>
            ))}
          </select>
          <input
            aria-label={`Label baris ${index + 1}`}
            name={`items[${index}][label]`}
            value={item.label}
            onChange={(e) => updateItem(index, { label: e.target.value })}
            placeholder="Contoh: Konsultasi gratis"
            className={`${inputClass} min-w-40 flex-1`}
          />
          <input
            aria-label={`Menit baris ${index + 1}`}
            name={`items[${index}][minutes]`}
            value={item.minutes}
            onChange={(e) => updateItem(index, { minutes: e.target.value })}
            placeholder="Menit"
            inputMode="numeric"
            className={`${inputClass} w-24`}
          />
          <button
            type="button"
            onClick={() =>
              setItems((rows) => rows.filter((_, i) => i !== index))
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
          setItems((rows) => [...rows, { treatmentId: "", label: "", minutes: "" }])
        }
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
      >
        + Tambah isi
      </button>
    </fieldset>
  );
}