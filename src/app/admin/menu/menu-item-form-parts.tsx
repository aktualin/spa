"use client";

import { MAX_MENU_DEPTH, type MenuLinkType } from "@/lib/domain/menu";

import type { MenuAdminRow } from "../actions/menu";

/** Judul form item menu + keterangan level. */
export function MenuItemFormHeader({
  item,
  isRoot,
  depth,
  parentLabel,
}: {
  item: MenuAdminRow | null;
  isRoot: boolean;
  depth: number;
  parentLabel: string | null;
}) {
  return (
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
  );
}

/** Pratinjau tautan akhir item menu (atau galat / belum terbit). */
export function LinkPreview({
  linkError,
  linkType,
  previewHref,
}: {
  linkError: string | null;
  linkType: MenuLinkType;
  previewHref: string | null;
}) {
  return (
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
  );
}