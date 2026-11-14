"use client";

import { MENU_LOCATIONS } from "@/lib/domain/menu";

import type { MenuAdminRow } from "../actions/menu";
import { Field, inputClass } from "../settings/_components/form-ui";
import { LOCATION_LABEL } from "./menu-manager";

/** Target tab + checkbox tampil. */
export function TargetFields({ item }: { item: MenuAdminRow | null }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Buka di" htmlFor="menu-target">
        <select
          id="menu-target"
          name="target"
          defaultValue={item?.openInNew ? "_blank" : "_self"}
          className={inputClass}
        >
          <option value="_self">Tab yang sama (_self)</option>
          <option value="_blank">Tab baru (_blank)</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="isVisible"
          defaultChecked={item?.isVisible ?? true}
          className="size-4 rounded border-neutral-300"
        />
        Tampilkan di situs
      </label>
    </div>
  );
}

/** Lokasi tampil (header/mobile/footer) — hanya untuk menu level 1. */
export function LocationsFieldset({ item }: { item: MenuAdminRow | null }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-neutral-700">Lokasi tampil</legend>
      <div className="flex flex-wrap gap-4">
        {MENU_LOCATIONS.map((location) => (
          <label key={location} className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="locations"
              value={location}
              defaultChecked={
                item ? item.locations.includes(location) : location !== "FOOTER"
              }
              className="size-4 rounded border-neutral-300"
            />
            {LOCATION_LABEL[location]}
          </label>
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        Sub-menu selalu ikut lokasi menu utamanya. Untuk footer, menu utama menjadi judul
        grup dan sub-menunya menjadi daftar tautan.
      </p>
    </fieldset>
  );
}