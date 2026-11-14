/** Validasi tautan menu navigasi — lihat `menu.ts`. */
import {
  MAX_MENU_LABEL_LENGTH,
  type MenuLinkType,
  type MenuRow,
} from "./menu.types.ts";

const ANCHOR_FRAGMENT = /^[A-Za-z0-9_-]+$/;

function isInternalPath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !/\s/.test(value);
}

function isSystemPath(path: string): boolean {
  return ["/admin", "/api", "/_next"].some(
    (p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`) || path.startsWith(`${p}#`),
  );
}

/** Pesan galat untuk kombinasi tipe + URL/halaman, atau null bila valid. */
export function validateMenuLink(input: {
  linkType: MenuLinkType;
  url: string | null;
  pageId: string | null;
}): string | null {
  const url = input.url?.trim() ?? "";

  switch (input.linkType) {
    case "PAGE":
      return input.pageId ? null : "Pilih halaman tujuan.";
    case "NO_LINK":
      return null;
    case "INTERNAL_URL":
      if (!url) return "URL internal wajib diisi.";
      if (!isInternalPath(url)) {
        return "URL internal harus diawali / tanpa spasi, mis. /treatments.";
      }
      if (url.includes("#")) return "Untuk tautan ke bagian halaman, pilih tipe Anchor.";
      if (isSystemPath(url)) return "Menu tidak boleh menuju /admin, /api, atau /_next.";
      return null;
    case "EXTERNAL_URL":
      if (!url) return "URL eksternal wajib diisi.";
      if (/^https?:\/\/[^\s/]+\.[^\s]+$/i.test(url)) return null;
      if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url)) return null;
      if (/^tel:\+?[0-9\s-]{6,}$/i.test(url)) return null;
      return "URL eksternal harus diawali https://, http://, mailto:, atau tel:.";
    case "ANCHOR": {
      if (!url) return "Anchor wajib diisi, mis. #packages atau /menu#packages.";
      const hash = url.indexOf("#");
      if (hash === -1) return "Anchor harus memuat tanda #, mis. #packages.";
      const path = url.slice(0, hash);
      const fragment = url.slice(hash + 1);
      if (path && !isInternalPath(path)) {
        return "Bagian sebelum # harus path internal yang diawali /.";
      }
      if (path && isSystemPath(path)) return "Menu tidak boleh menuju /admin, /api, atau /_next.";
      if (!ANCHOR_FRAGMENT.test(fragment)) {
        return "Nama anchor hanya boleh huruf, angka, - dan _.";
      }
      return null;
    }
  }
}

export function validateMenuLabel(label: string): string | null {
  const trimmed = label.trim();
  if (!trimmed) return "Label wajib diisi.";
  if (trimmed.length > MAX_MENU_LABEL_LENGTH) {
    return `Label maksimal ${MAX_MENU_LABEL_LENGTH} karakter.`;
  }
  return null;
}

/** URL publik item, atau null bila tidak bertautan / tujuannya hilang. */
export function resolveMenuHref(row: Pick<MenuRow, "linkType" | "url" | "page">): string | null {
  switch (row.linkType) {
    case "PAGE":
      return row.page?.published ? `/${row.page.slug}` : null;
    case "NO_LINK":
      return null;
    default:
      return row.url?.trim() || null;
  }
}

/** Item PAGE yang halamannya dihapus atau belum/tidak lagi terbit. */
export function isBrokenMenuLink(row: Pick<MenuRow, "linkType" | "page">): boolean {
  return row.linkType === "PAGE" && !row.page?.published;
}