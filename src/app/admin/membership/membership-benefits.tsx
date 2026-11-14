"use client";

import { useState } from "react";

import { inputClass, secondaryButtonClass } from "../promos/_kit/form-ui";

/** Daftar benefit tier: satu baris per benefit, bisa diurutkan/dihapus. */
export function BenefitsFieldset({ initial }: { initial: string[] }) {
  const [benefits, setBenefits] = useState<string[]>(
    initial.length > 0 ? initial : [""],
  );

  function updateBenefit(index: number, value: string) {
    setBenefits((rows) => rows.map((row, i) => (i === index ? value : row)));
  }

  function moveBenefit(index: number, direction: -1 | 1) {
    setBenefits((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-neutral-700">Benefit</legend>
      <p className="text-xs text-neutral-500">
        Satu benefit per baris. Baris kosong diabaikan saat disimpan. Urutan
        baris menentukan urutan tampil.
      </p>

      {benefits.map((benefit, index) => (
        <div key={index} className="flex flex-wrap gap-2">
          <input
            aria-label={`Benefit baris ${index + 1}`}
            name="benefits"
            value={benefit}
            onChange={(event) => updateBenefit(index, event.target.value)}
            placeholder="Contoh: 1 sesi treatment 60 menit per bulan"
            className={`${inputClass} min-w-48 flex-1`}
          />
          <button
            type="button"
            onClick={() => moveBenefit(index, -1)}
            aria-label={`Naikkan benefit baris ${index + 1}`}
            className={secondaryButtonClass}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveBenefit(index, 1)}
            aria-label={`Turunkan benefit baris ${index + 1}`}
            className={secondaryButtonClass}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() =>
              setBenefits((rows) => rows.filter((_, i) => i !== index))
            }
            aria-label={`Hapus benefit baris ${index + 1}`}
            className={`${secondaryButtonClass} text-red-700`}
          >
            Hapus
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setBenefits((rows) => [...rows, ""])}
        className={secondaryButtonClass}
      >
        + Tambah benefit
      </button>
    </fieldset>
  );
}