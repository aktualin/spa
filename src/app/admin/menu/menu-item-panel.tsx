"use client";

import type { MenuAdminRow } from "../actions/menu";
import { Field, inputClass } from "../settings/_components/form-ui";
import { HighlightCardFields } from "./menu-item-highlight";

/** Pengaturan mega menu header (opsional) — hanya untuk menu level 1. */
export function MegaMenuPanel({ item }: { item: MenuAdminRow | null }) {
  return (
    <details className="rounded-md border border-neutral-200 bg-white px-3 py-2">
      <summary className="cursor-pointer text-sm text-neutral-700">
        Pengaturan mega menu header (opsional)
      </summary>
      <div className="mt-3 space-y-3">
        <Field
          label="Teks tautan &quot;lihat semua&quot;"
          htmlFor="menu-panel-link"
          hint="Muncul di bawah panel sub-menu, menuju alamat menu utama ini. Kosongkan bila tidak perlu."
        >
          <input
            id="menu-panel-link"
            name="panelLinkLabel"
            defaultValue={item?.panelLinkLabel ?? ""}
            maxLength={60}
            className={inputClass}
          />
        </Field>
        <Field
          label="Kunci panel"
          htmlFor="menu-panel-key"
          hint="Kunci teknis panel (mis. services, corporate). Biarkan seperti apa adanya bila ragu."
        >
          <input
            id="menu-panel-key"
            name="panelKey"
            defaultValue={item?.panelKey ?? ""}
            maxLength={40}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field
          label="Lebar panel"
          htmlFor="menu-panel-width"
          hint="Otomatis: lebar mengikuti jumlah kolom sub-menu."
        >
          <select
            id="menu-panel-width"
            name="panelWidth"
            defaultValue={
              item?.panelWidth === null || item?.panelWidth === undefined
                ? ""
                : item.panelWidth >= 2
                  ? "wide"
                  : "narrow"
            }
            className={inputClass}
          >
            <option value="">Otomatis</option>
            <option value="narrow">Sempit (satu kolom)</option>
            <option value="wide">Lebar (dua kolom)</option>
          </select>
        </Field>

        <HighlightCardFields item={item} />
      </div>
    </details>
  );
}