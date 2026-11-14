import { isSafeCtaHref, isSafeImageUrl } from "@/lib/domain/homepage-banner";
import { validateParent, type MenuLinkType, type MenuLocation } from "@/lib/domain/menu";
import { SLUG_PATTERN } from "@/lib/domain/slug";

import type { MenuItemInput } from "./menu.schemas";

type MenuRow = { id: string; parentId: string | null; sortOrder: number };

/** Data siap tulis ke MenuItem (cocok untuk create maupun update). */
type MenuItemData = {
  label: string;
  linkType: MenuLinkType;
  url: string | null;
  pageId: string | null;
  isVisible: boolean;
  openInNew: boolean;
  locations: MenuLocation[];
  panelKey: string | null;
  panelLinkLabel: string | null;
  panelWidth: number | null;
  highlightImageUrl: string | null;
  highlightLabel: string | null;
  highlightHref: string | null;
  highlightBadge: string | null;
  highlightEyebrow: string | null;
};

type ResolveResult = { ok: true; parentId: string | null; data: MenuItemData } | { ok: false; error: string };

/**
 * Tentukan induk item + validasi aturan level 1 (lokasi, panel, kartu promo),
 * lalu bangun data siap tulis. Posisi item lama tidak diubah dari form ini.
 */
export function resolveMenuItemData(
  input: MenuItemInput,
  url: string | null,
  pageId: string | null,
  all: MenuRow[],
): ResolveResult {
  let parentId: string | null;
  if (input.id) {
    const current = all.find((row) => row.id === input.id);
    if (!current) return { ok: false, error: "Item menu tidak ditemukan. Mungkin sudah dihapus." };
    // Posisi diubah lewat susunan (drag-and-drop), bukan dari form ini.
    parentId = current.parentId;
  } else {
    parentId = input.parentId ?? null;
    const parentError = validateParent(all, null, parentId);
    if (parentError) return { ok: false, error: parentError };
  }

  const isRoot = parentId === null;
  if (isRoot && input.locations.length === 0) {
    return { ok: false, error: "Pilih minimal satu lokasi tampil (Header, Mobile, atau Footer)." };
  }
  if (isRoot && input.panelKey && !SLUG_PATTERN.test(input.panelKey)) {
    return { ok: false, error: "Kunci panel hanya boleh huruf kecil, angka, dan tanda hubung." };
  }

  const highlightImageUrl = isRoot ? input.highlightImageUrl || null : null;
  const highlightLabel = isRoot ? input.highlightLabel || null : null;
  const highlightHref = isRoot ? input.highlightHref || null : null;
  // Badge & eyebrow opsional — hanya level 1, seperti field highlight lain.
  const highlightBadge = isRoot ? input.highlightBadge || null : null;
  const highlightEyebrow = isRoot ? input.highlightEyebrow || null : null;

  if (highlightImageUrl && !isSafeImageUrl(highlightImageUrl)) {
    return { ok: false, error: "Gambar kartu promo harus berupa alamat https:// (unggah lewat Media Library)." };
  }
  if (highlightHref && !isSafeCtaHref(highlightHref)) {
    return { ok: false, error: "Tujuan kartu promo harus berupa path internal (/menu), anchor (#promo), atau https://…" };
  }
  // Kartu hanya tampil bila lengkap; cegah admin mengira kartunya sudah jadi.
  const filled = [highlightImageUrl, highlightLabel, highlightHref].filter(Boolean).length;
  if (filled > 0 && filled < 3) {
    return { ok: false, error: "Kartu promo panel perlu gambar, label, dan tujuan — lengkapi ketiganya atau kosongkan semua." };
  }

  const data = {
    label: input.label.trim(),
    linkType: input.linkType,
    url,
    pageId,
    isVisible: input.isVisible,
    openInNew: input.openInNew,
    // Lokasi & panel hanya berlaku untuk level 1; anak mengikuti induknya.
    locations: isRoot ? input.locations : [],
    panelKey: isRoot ? input.panelKey || null : null,
    panelLinkLabel: isRoot ? input.panelLinkLabel || null : null,
    // Kosong = lebar panel mengikuti jumlah kolom sub-menu.
    panelWidth: isRoot && input.panelWidth ? (input.panelWidth === "wide" ? 2 : 1) : null,
    highlightImageUrl,
    highlightLabel,
    highlightHref,
    highlightBadge,
    highlightEyebrow,
  };

  return { ok: true, parentId, data };
}