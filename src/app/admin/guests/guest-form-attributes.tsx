"use client";

import { MAX_ATTRIBUTE_KEY, MAX_ATTRIBUTE_VALUE } from "@/lib/domain/guests";

import { inputClass, secondaryButtonClass } from "../promos/_kit/form-ui";

export type AttributeRow = { key: string; value: string };

/**
 * Editor baris key-value untuk section "Atribut Tambahan". Semua baris
 * memakai name="attrKey"/"attrValue" berulang; Server Action memasangkannya
 * berdasarkan urutan (pairAttributeRows). Baris ber-key kosong diabaikan.
 */
export function AttributesEditor({
  rows,
  onRowsChange,
}: {
  rows: AttributeRow[];
  onRowsChange: (rows: AttributeRow[]) => void;
}) {
  const update = (index: number, field: keyof AttributeRow, value: string) => {
    onRowsChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="space-y-2">
      {/* Index sebagai key aman: baris hanya ditambah/dihapus dari daftar ini. */}
      {rows.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          <input
            name="attrKey"
            value={row.key}
            onChange={(event) => update(index, "key", event.target.value)}
            placeholder="key (contoh: warna_rambut)"
            maxLength={MAX_ATTRIBUTE_KEY}
            aria-label={`Key atribut ${index + 1}`}
            className={inputClass}
          />
          <input
            name="attrValue"
            value={row.value}
            onChange={(event) => update(index, "value", event.target.value)}
            placeholder="value (contoh: hitam)"
            maxLength={MAX_ATTRIBUTE_VALUE}
            aria-label={`Nilai atribut ${index + 1}`}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onRowsChange(rows.filter((_, i) => i !== index))}
            className={secondaryButtonClass}
            aria-label={`Hapus baris atribut ${index + 1}`}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onRowsChange([...rows, { key: "", value: "" }])}
        className={secondaryButtonClass}
      >
        + Tambah atribut
      </button>
    </div>
  );
}
