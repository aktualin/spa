"use client";

import { useState } from "react";

import { PROGRAM_LIMITS } from "@/lib/domain/membership";

import { inputClass, secondaryButtonClass } from "../../promos/_kit/form-ui";

type Row = { key: number; title: string; body: string };

let nextKey = 0;
const toRows = (items: { title: string; body: string }[]): Row[] =>
  (items.length > 0 ? items : [{ title: "", body: "" }]).map((item) => ({
    key: nextKey++,
    ...item,
  }));

/**
 * Daftar baris dua kolom (judul + keterangan) yang bisa ditambah, dihapus,
 * dan diurutkan. Dikirim sebagai `<prefix>Title` / `<prefix>Body` berulang.
 */
export function RowList({
  legend,
  titleName,
  bodyName,
  titleLabel,
  bodyLabel,
  initial,
  max,
}: {
  legend: string;
  titleName: string;
  bodyName: string;
  titleLabel: string;
  bodyLabel: string;
  initial: { title: string; body: string }[];
  max: number;
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(initial));

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
    <fieldset className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-800">{legend}</legend>
      {rows.map((row, index) => (
        <div key={row.key} className="space-y-2 rounded-md bg-neutral-50 p-3">
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
            <span>Baris {index + 1}</span>
            <span className="flex gap-1.5">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={secondaryButtonClass} aria-label={`Naikkan baris ${index + 1}`}>
                ↑
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className={secondaryButtonClass} aria-label={`Turunkan baris ${index + 1}`}>
                ↓
              </button>
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
                className={secondaryButtonClass}
              >
                Hapus
              </button>
            </span>
          </div>
          <input
            name={titleName}
            defaultValue={row.title}
            aria-label={`${titleLabel} baris ${index + 1}`}
            placeholder={titleLabel}
            maxLength={PROGRAM_LIMITS.itemTitle}
            className={inputClass}
          />
          <textarea
            name={bodyName}
            defaultValue={row.body}
            aria-label={`${bodyLabel} baris ${index + 1}`}
            placeholder={bodyLabel}
            maxLength={PROGRAM_LIMITS.itemBody}
            rows={2}
            className={inputClass}
          />
        </div>
      ))}
      {rows.length < max ? (
        <button
          type="button"
          onClick={() => setRows((current) => [...current, { key: nextKey++, title: "", body: "" }])}
          className={secondaryButtonClass}
        >
          + Tambah baris
        </button>
      ) : null}
    </fieldset>
  );
}