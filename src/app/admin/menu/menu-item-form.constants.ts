import type { MenuLinkType } from "@/lib/domain/menu";

import type { ActionState } from "../actions/menu";

export const TYPE_HINT: Record<MenuLinkType, string> = {
  PAGE: "Pilih halaman dari modul Halaman & URL. Bila slug halaman diubah, menu ikut berubah otomatis.",
  INTERNAL_URL: "Alamat di situs ini, diawali /. Contoh: /treatments",
  EXTERNAL_URL: "Alamat situs lain (https://…), email (mailto:…), atau telepon (tel:…).",
  ANCHOR: "Bagian tertentu di sebuah halaman. Contoh: /menu#packages atau #packages",
  NO_LINK: "Hanya judul, tidak bisa diklik. Cocok untuk judul kolom di mega menu.",
};

export const URL_PLACEHOLDER: Partial<Record<MenuLinkType, string>> = {
  INTERNAL_URL: "/treatments",
  EXTERNAL_URL: "https://",
  ANCHOR: "/menu#packages",
};

export const initialState: ActionState = { error: null };