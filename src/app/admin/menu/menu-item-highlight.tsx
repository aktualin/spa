"use client";

import type { MenuAdminRow } from "../actions/menu";
import { ImageField } from "../image-field";
import { Field, inputClass } from "../settings/_components/form-ui";

/** Kartu promo di panel mega menu (gambar, label, tujuan, badge, eyebrow). */
export function HighlightCardFields({ item }: { item: MenuAdminRow | null }) {
  return (
    <fieldset className="space-y-3 rounded-md border border-neutral-200 p-3">
      <legend className="px-1 text-sm font-medium text-neutral-700">
        Kartu promo di panel
      </legend>
      <p className="text-xs text-neutral-500">
        Isi gambar, label, dan tujuan agar kartu tampil. Kosongkan semuanya bila
        panel ini tidak perlu kartu promo. Badge dan eyebrow opsional.
      </p>
      <ImageField
        name="highlightImageUrl"
        label="Gambar kartu"
        folder="menu"
        defaultValue={item?.highlightImageUrl ?? ""}
      />
      <Field label="Label kartu" htmlFor="menu-highlight-label">
        <input
          id="menu-highlight-label"
          name="highlightLabel"
          defaultValue={item?.highlightLabel ?? ""}
          maxLength={60}
          className={inputClass}
        />
      </Field>
      <Field
        label="Tujuan kartu"
        htmlFor="menu-highlight-href"
        hint="Path internal (/membership), anchor (#packages), atau https://…"
      >
        <input
          id="menu-highlight-href"
          name="highlightHref"
          defaultValue={item?.highlightHref ?? ""}
          maxLength={500}
          className={`${inputClass} font-mono`}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Badge kartu (opsional)"
          htmlFor="menu-highlight-badge"
          hint="Label kecil di pojok kartu, mis. BARU. Maks. 30 karakter."
        >
          <input
            id="menu-highlight-badge"
            name="highlightBadge"
            defaultValue={item?.highlightBadge ?? ""}
            maxLength={30}
            className={inputClass}
          />
        </Field>
        <Field
          label="Eyebrow kartu (opsional)"
          htmlFor="menu-highlight-eyebrow"
          hint="Teks kecil di atas judul kartu. Maks. 60 karakter."
        >
          <input
            id="menu-highlight-eyebrow"
            name="highlightEyebrow"
            defaultValue={item?.highlightEyebrow ?? ""}
            maxLength={60}
            className={inputClass}
          />
        </Field>
      </div>
    </fieldset>
  );
}