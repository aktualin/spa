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
      <legend className="text-sm font-medium text-neutral-700">Benefits</legend>
      <p className="text-xs text-neutral-500">
        One benefit per row. Empty rows are ignored when saving. The row
        order determines the display order.
      </p>

      {benefits.map((benefit, index) => (
        <div key={index} className="flex flex-wrap gap-2">
          <input
            aria-label={`Benefit row ${index + 1}`}
            name="benefits"
            value={benefit}
            onChange={(event) => updateBenefit(index, event.target.value)}
            placeholder="e.g. 1 session of a 60-minute treatment per month"
            className={`${inputClass} min-w-48 flex-1`}
          />
          <button
            type="button"
            onClick={() => moveBenefit(index, -1)}
            aria-label={`Move benefit row ${index + 1} up`}
            className={secondaryButtonClass}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveBenefit(index, 1)}
            aria-label={`Move benefit row ${index + 1} down`}
            className={secondaryButtonClass}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() =>
              setBenefits((rows) => rows.filter((_, i) => i !== index))
            }
            aria-label={`Delete benefit row ${index + 1}`}
            className={`${secondaryButtonClass} text-red-700`}
          >
            Delete
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setBenefits((rows) => [...rows, ""])}
        className={secondaryButtonClass}
      >
        + Add benefit
      </button>
    </fieldset>
  );
}