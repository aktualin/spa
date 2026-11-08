"use client";

import { useActionState, useState } from "react";

import {
  MENU_LINK_TYPES,
  MENU_LOCATIONS,
  MAX_MENU_DEPTH,
  resolveMenuHref,
  validateMenuLink,
  type MenuLinkType,
} from "@/lib/domain/menu";

import {
  saveMenuItemAction,
  type ActionState,
  type MenuAdminRow,
  type MenuPageOption,
} from "../actions/menu";
import { ImageField } from "../image-field";
import { ErrorMessage, Field, SaveButton, inputClass } from "../settings/_components/form-ui";
import { LINK_TYPE_LABEL, LOCATION_LABEL } from "./menu-manager";

const TYPE_HINT: Record<MenuLinkType, string> = {
  PAGE: "Pilih halaman dari modul Halaman & URL. Bila slug halaman diubah, menu ikut berubah otomatis.",
  INTERNAL_URL: "Alamat di situs ini, diawali /. Contoh: /treatments",
  EXTERNAL_URL: "Alamat situs lain (https://…), email (mailto:…), atau telepon (tel:…).",
  ANCHOR: "Bagian tertentu di sebuah halaman. Contoh: /menu#packages atau #packages",
  NO_LINK: "Hanya judul, tidak bisa diklik. Cocok untuk judul kolom di mega menu.",
};

const URL_PLACEHOLDER: Partial<Record<MenuLinkType, string>> = {
  INTERNAL_URL: "/treatments",
  EXTERNAL_URL: "https://",
  ANCHOR: "/menu#packages",
};

const initialState: ActionState = { error: null };

export function MenuItemForm({
  item,
  parentId,
  parentLabel,
  depth,
  pages,
  onCancel,
}: {
  item: MenuAdminRow | null;
  parentId: string | null;
  parentLabel: string | null;
  depth: number;
  pages: MenuPageOption[];
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(saveMenuItemAction, initialState);
  const [linkType, setLinkType] = useState<MenuLinkType>(item?.linkType ?? "INTERNAL_URL");
  const [url, setUrl] = useState(item?.url ?? "");
  const [pageId, setPageId] = useState(item?.pageId ?? "");

  const isRoot = parentId === null;
  const selectedPage = pages.find((p) => p.id === pageId) ?? null;
  const needsUrl = linkType !== "PAGE" && linkType !== "NO_LINK";

  const linkError = validateMenuLink({
    linkType,
    url: needsUrl ? url : null,
    pageId: linkType === "PAGE" ? pageId || null : null,
  });
  const previewHref = linkError
    ? null
    : resolveMenuHref({
        linkType,
        url: needsUrl ? url : null,
        page: selectedPage ? { slug: selectedPage.slug, published: selectedPage.published } : null,
      });

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-neutral-300 bg-neutral-50 p-4"
    >
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">
          {item ? `Ubah "${item.label}"` : isRoot ? "Tambah menu utama" : "Tambah sub-menu"}
        </h2>
        <p className="text-xs text-neutral-500">
          {isRoot
            ? "Level 1 — tampil langsung di bar menu / grup footer."
            : `Level ${depth} dari ${MAX_MENU_DEPTH}, di bawah "${parentLabel}".`}
        </p>
      </div>

      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      {!item && parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}

      <Field label="Label" htmlFor="menu-label">
        <input
          id="menu-label"
          name="label"
          defaultValue={item?.label ?? ""}
          maxLength={60}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Tipe tautan" htmlFor="menu-type" hint={TYPE_HINT[linkType]}>
        <select
          id="menu-type"
          name="linkType"
          value={linkType}
          onChange={(event) => setLinkType(event.target.value as MenuLinkType)}
          className={inputClass}
        >
          {MENU_LINK_TYPES.map((type) => (
            <option key={type} value={type}>
              {LINK_TYPE_LABEL[type]}
            </option>
          ))}
        </select>
      </Field>

      {linkType === "PAGE" ? (
        <Field label="Halaman tujuan" htmlFor="menu-page">
          {pages.length === 0 ? (
            <p className="text-sm text-neutral-600">
              Belum ada halaman. Buat dulu di modul <strong>Halaman &amp; URL</strong>.
            </p>
          ) : (
            <select
              id="menu-page"
              name="pageId"
              value={pageId}
              onChange={(event) => setPageId(event.target.value)}
              className={inputClass}
            >
              <option value="">— pilih halaman —</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title} — /{page.slug}
                  {page.published ? "" : " (Draf)"}
                </option>
              ))}
            </select>
          )}
        </Field>
      ) : null}

      {needsUrl ? (
        <Field label="Alamat" htmlFor="menu-url">
          <input
            id="menu-url"
            name="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={URL_PLACEHOLDER[linkType]}
            className={`${inputClass} font-mono`}
          />
        </Field>
      ) : null}

      <div className="rounded-md bg-white px-3 py-2 text-xs">
        <span className="text-neutral-500">Tautan akhir: </span>
        {linkError ? (
          <span className="text-red-700">{linkError}</span>
        ) : linkType === "NO_LINK" ? (
          <span className="text-neutral-700">tidak bisa diklik</span>
        ) : previewHref ? (
          <code className="text-neutral-900">{previewHref}</code>
        ) : (
          <span className="text-amber-800">
            Halaman ini belum terbit — item menu tidak tampil sampai halaman diterbitkan.
          </span>
        )}
      </div>

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

      {isRoot ? (
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
      ) : null}

      {isRoot ? (
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

            <fieldset className="space-y-3 rounded-md border border-neutral-200 p-3">
              <legend className="px-1 text-sm font-medium text-neutral-700">
                Kartu promo di panel
              </legend>
              <p className="text-xs text-neutral-500">
                Isi ketiganya agar kartu tampil. Kosongkan semuanya bila panel ini tidak
                perlu kartu promo.
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
            </fieldset>
          </div>
        </details>
      ) : null}

      <ErrorMessage error={state.error} />

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
        <SaveButton label={item ? "Simpan perubahan" : "Tambah"} />
        <button type="button" onClick={onCancel} className="text-sm text-neutral-600 hover:underline">
          Batal
        </button>
      </div>
    </form>
  );
}
