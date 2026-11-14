"use client";

import { MENU_LINK_TYPES, type MenuLinkType } from "@/lib/domain/menu";

import type { MenuPageOption } from "../actions/menu";
import { Field, inputClass } from "../settings/_components/form-ui";
import { LINK_TYPE_LABEL } from "./menu-manager";
import { TYPE_HINT, URL_PLACEHOLDER } from "./menu-item-form.constants";

/** Tipe tautan + halaman tujuan / alamat URL. */
export function LinkTypeFields({
  linkType,
  setLinkType,
  url,
  setUrl,
  pageId,
  setPageId,
  pages,
  needsUrl,
}: {
  linkType: MenuLinkType;
  setLinkType: (value: MenuLinkType) => void;
  url: string;
  setUrl: (value: string) => void;
  pageId: string;
  setPageId: (value: string) => void;
  pages: MenuPageOption[];
  needsUrl: boolean;
}) {
  return (
    <>
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
    </>
  );
}