"use client";

import type { MenuAdminRow } from "../actions/menu";
import { structureOf } from "./menu-manager.constants";

/** Tombol tambah menu utama + petunjuk drag-and-drop. */
export function AddRootToolbar({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        + Tambah menu utama
      </button>
      <p className="text-xs text-neutral-500">
        Seret ke tengah item untuk menjadikannya sub-menu, ke tepi atas/bawah untuk menyisipkan.
      </p>
    </div>
  );
}

/** Banner "susunan berubah": simpan struktur baru atau batalkan. */
export function StructureBanner({
  items,
  saveStructure,
  onCancel,
}: {
  items: MenuAdminRow[];
  saveStructure: (formData: FormData) => void;
  onCancel: () => void;
}) {
  return (
    <form
      action={saveStructure}
      className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2"
    >
      <input type="hidden" name="structure" value={JSON.stringify(structureOf(items))} />
      <p className="flex-1 text-sm text-amber-900">
        Susunan menu berubah. Periksa pratinjau, lalu simpan.
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-amber-400 px-3 py-1.5 text-sm text-amber-900"
      >
        Batalkan
      </button>
      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
      >
        Simpan susunan
      </button>
    </form>
  );
}