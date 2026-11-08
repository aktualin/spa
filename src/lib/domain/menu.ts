/**
 * Aturan menu navigasi: validasi tautan & struktur, perpindahan item, dan
 * pembentukan pohon per lokasi. Murni — dipakai Server Action, halaman admin
 * (pratinjau di browser), pembaca konten publik, dan unit test.
 */

export const MAX_MENU_DEPTH = 3;
export const MAX_MENU_LABEL_LENGTH = 60;

export const MENU_LINK_TYPES = [
  "PAGE",
  "INTERNAL_URL",
  "EXTERNAL_URL",
  "ANCHOR",
  "NO_LINK",
] as const;
export type MenuLinkType = (typeof MENU_LINK_TYPES)[number];

export const MENU_LOCATIONS = ["HEADER", "MOBILE", "FOOTER"] as const;
export type MenuLocation = (typeof MENU_LOCATIONS)[number];

export type MenuRow = {
  id: string;
  parentId: string | null;
  label: string;
  linkType: MenuLinkType;
  url: string | null;
  pageId: string | null;
  /** Halaman tujuan untuk PAGE; null bila halaman sudah dihapus. */
  page: { slug: string; published: boolean } | null;
  sortOrder: number;
  isVisible: boolean;
  openInNew: boolean;
  locations: MenuLocation[];
  panelKey: string | null;
  panelLinkLabel: string | null;
};

export type MenuNode = {
  id: string;
  label: string;
  /** null untuk NO_LINK. */
  href: string | null;
  openInNew: boolean;
  panelKey: string | null;
  panelLinkLabel: string | null;
  children: MenuNode[];
};

/* ---------- validasi tautan ---------- */

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

/* ---------- struktur pohon ---------- */

type Link = { id: string; parentId: string | null };

function parentMap(rows: readonly Link[]): Map<string, string | null> {
  return new Map(rows.map((r) => [r.id, r.parentId]));
}

/** Kedalaman item (level 1 = akar). Infinity bila rantai induknya berputar. */
export function depthOf(rows: readonly Link[], id: string): number {
  const parents = parentMap(rows);
  let depth = 1;
  let current = parents.get(id) ?? null;
  const seen = new Set([id]);
  while (current !== null) {
    if (seen.has(current)) return Infinity;
    seen.add(current);
    depth += 1;
    current = parents.get(current) ?? null;
  }
  return depth;
}

/** Tinggi subpohon: 1 untuk item tanpa anak. */
export function subtreeHeight(rows: readonly Link[], id: string): number {
  const children = rows.filter((r) => r.parentId === id);
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map((c) => subtreeHeight(rows, c.id)));
}

function isDescendant(rows: readonly Link[], ancestorId: string, id: string): boolean {
  const parents = parentMap(rows);
  let current = parents.get(id) ?? null;
  const seen = new Set<string>();
  while (current !== null && !seen.has(current)) {
    if (current === ancestorId) return true;
    seen.add(current);
    current = parents.get(current) ?? null;
  }
  return false;
}

/**
 * Validasi memindah/menaruh `itemId` (null = item baru) di bawah `parentId`.
 */
export function validateParent(
  rows: readonly Link[],
  itemId: string | null,
  parentId: string | null,
): string | null {
  if (parentId === null) {
    return itemId && subtreeHeight(rows, itemId) > MAX_MENU_DEPTH
      ? `Menu maksimal ${MAX_MENU_DEPTH} level.`
      : null;
  }
  if (itemId && parentId === itemId) return "Item menu tidak boleh menjadi induk dirinya sendiri.";
  if (!rows.some((r) => r.id === parentId)) return "Induk menu tidak ditemukan.";
  if (itemId && isDescendant(rows, itemId, parentId)) {
    return "Item tidak boleh dipindah ke dalam sub-menunya sendiri (membentuk siklus).";
  }
  const height = itemId ? subtreeHeight(rows, itemId) : 1;
  if (depthOf(rows, parentId) + height > MAX_MENU_DEPTH) {
    return `Menu maksimal ${MAX_MENU_DEPTH} level (induk → sub-menu → sub-sub-menu).`;
  }
  return null;
}

/** Validasi seluruh struktur, dipakai saat menyimpan hasil drag-and-drop. */
export function validateStructure(rows: readonly Link[]): string | null {
  const ids = new Set(rows.map((r) => r.id));
  for (const row of rows) {
    if (row.parentId === row.id) return "Item menu tidak boleh menjadi induk dirinya sendiri.";
    if (row.parentId !== null && !ids.has(row.parentId)) return "Induk menu tidak ditemukan.";
  }
  for (const row of rows) {
    const depth = depthOf(rows, row.id);
    if (depth === Infinity) return "Struktur menu membentuk siklus.";
    if (depth > MAX_MENU_DEPTH) return `Menu maksimal ${MAX_MENU_DEPTH} level.`;
  }
  return null;
}

export function canAddChild(rows: readonly Link[], id: string): boolean {
  return depthOf(rows, id) < MAX_MENU_DEPTH;
}

/* ---------- perpindahan (drag-and-drop & tombol naik/turun) ---------- */

type Sortable = Link & { sortOrder: number; label: string };

function compareItems(a: Sortable, b: Sortable): number {
  return a.sortOrder - b.sortOrder || a.label.localeCompare(b.label) || a.id.localeCompare(b.id);
}

export function siblingsOf<T extends Sortable>(rows: readonly T[], parentId: string | null): T[] {
  return rows.filter((r) => r.parentId === parentId).sort(compareItems);
}

function withOrder<T extends Sortable>(rows: readonly T[], parentId: string | null, ordered: T[]): T[] {
  const order = new Map(ordered.map((r, index) => [r.id, index]));
  return rows.map((r) =>
    order.has(r.id) ? { ...r, parentId, sortOrder: order.get(r.id)! } : r,
  );
}

export type DropPosition = "before" | "after" | "inside";

export type MoveResult<T> = { rows: T[]; error: null } | { rows: null; error: string };

/** Pindahkan `dragId` relatif terhadap `targetId`. Urutan saudara dinomori ulang. */
export function moveItem<T extends Sortable>(
  rows: readonly T[],
  dragId: string,
  targetId: string,
  position: DropPosition,
): MoveResult<T> {
  if (dragId === targetId) return { rows: null, error: "Item tidak bisa dipindah ke dirinya sendiri." };
  const drag = rows.find((r) => r.id === dragId);
  const target = rows.find((r) => r.id === targetId);
  if (!drag || !target) return { rows: null, error: "Item menu tidak ditemukan." };

  const newParentId = position === "inside" ? target.id : target.parentId;
  const error = validateParent(rows, dragId, newParentId);
  if (error) return { rows: null, error };

  const detached = rows.map((r) => (r.id === dragId ? { ...r, parentId: newParentId } : r));
  // Saudara lama dirapikan agar tidak ada celah urutan.
  let next = withOrder(detached, drag.parentId, siblingsOf(detached, drag.parentId).filter((r) => r.id !== dragId));

  const siblings = siblingsOf(next, newParentId).filter((r) => r.id !== dragId);
  const moved = next.find((r) => r.id === dragId)!;
  let index = siblings.length;
  if (position !== "inside") {
    const targetIndex = siblings.findIndex((r) => r.id === targetId);
    index = position === "before" ? targetIndex : targetIndex + 1;
  }
  siblings.splice(index, 0, moved);
  next = withOrder(next, newParentId, siblings);
  return { rows: next, error: null };
}

/** Tukar posisi dengan saudara sebelum (-1) atau sesudah (+1). */
export function moveSibling<T extends Sortable>(rows: readonly T[], id: string, direction: -1 | 1): T[] {
  const item = rows.find((r) => r.id === id);
  if (!item) return [...rows];
  const siblings = siblingsOf(rows, item.parentId);
  const index = siblings.findIndex((r) => r.id === id);
  const swap = index + direction;
  if (swap < 0 || swap >= siblings.length) return [...rows];
  [siblings[index], siblings[swap]] = [siblings[swap], siblings[index]];
  return withOrder(rows, item.parentId, siblings);
}

const DEFAULT_ROOT_LOCATIONS: MenuLocation[] = ["HEADER", "MOBILE"];

type Located = Link & { locations: MenuLocation[] };

/**
 * Anak tidak menyimpan lokasi. Bila sebuah anak naik menjadi level 1, ia
 * mewarisi lokasi akar lamanya supaya tidak hilang dari semua lokasi.
 */
export function inheritRootLocations<T extends Located>(
  before: readonly Located[],
  after: readonly T[],
): T[] {
  const rootLocationsBefore = (id: string): MenuLocation[] => {
    const parents = parentMap(before);
    let current = id;
    const seen = new Set<string>();
    while (!seen.has(current)) {
      seen.add(current);
      const parent = parents.get(current) ?? null;
      if (parent === null) break;
      current = parent;
    }
    const root = before.find((r) => r.id === current);
    return root && root.locations.length > 0 ? root.locations : DEFAULT_ROOT_LOCATIONS;
  };

  return after.map((row) =>
    row.parentId === null && row.locations.length === 0
      ? { ...row, locations: [...rootLocationsBefore(row.id)] }
      : row,
  );
}

/* ---------- pohon publik ---------- */

/**
 * Pohon menu untuk satu lokasi. Lokasi dibaca dari item level 1; anak
 * mengikuti induk. Item tersembunyi dan tautan halaman yang hilang dibuang
 * beserta sub-menunya, sehingga tidak ada tautan rusak di situs.
 */
export function buildMenuTree(rows: readonly MenuRow[], location: MenuLocation): MenuNode[] {
  const build = (parentId: string | null, depth: number): MenuNode[] => {
    if (depth > MAX_MENU_DEPTH) return [];
    return siblingsOf(rows, parentId)
      .filter((row) => row.isVisible && !isBrokenMenuLink(row))
      .filter((row) => parentId !== null || row.locations.includes(location))
      .map((row) => ({
        id: row.id,
        label: row.label,
        href: resolveMenuHref(row),
        openInNew: row.openInNew,
        panelKey: row.panelKey,
        panelLinkLabel: row.panelLinkLabel,
        children: build(row.id, depth + 1),
      }));
  };
  return build(null, 1);
}
