"use client";

import { useActionState, useMemo, useState, type DragEvent } from "react";

import {
  canAddChild,
  depthOf,
  inheritRootLocations,
  isBrokenMenuLink,
  MAX_MENU_DEPTH,
  moveItem,
  moveSibling,
  resolveMenuHref,
  siblingsOf,
  type DropPosition,
  type MenuLinkType,
  type MenuLocation,
} from "@/lib/domain/menu";

import {
  deleteMenuItemAction,
  saveMenuStructureAction,
  type ActionState,
  type MenuAdminRow,
  type MenuPageOption,
} from "../actions/menu";
import { Badge, ConfirmSubmit, ErrorMessage } from "../settings/_components/form-ui";
import { MenuItemForm } from "./menu-item-form";
import { MenuPreview } from "./menu-preview";

export const LINK_TYPE_LABEL: Record<MenuLinkType, string> = {
  PAGE: "Halaman",
  INTERNAL_URL: "URL internal",
  EXTERNAL_URL: "URL eksternal",
  ANCHOR: "Anchor",
  NO_LINK: "Tanpa tautan",
};

export const LOCATION_LABEL: Record<MenuLocation, string> = {
  HEADER: "Header",
  MOBILE: "Mobile",
  FOOTER: "Footer",
};

type Editor = { mode: "create"; parentId: string | null } | { mode: "edit"; id: string } | null;
type DropTarget = { id: string; position: DropPosition } | null;

const initialState: ActionState = { error: null };

function structureOf(rows: readonly MenuAdminRow[]) {
  return rows
    .map((r) => ({ id: r.id, parentId: r.parentId, sortOrder: r.sortOrder }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function countDescendants(rows: readonly MenuAdminRow[], id: string): number {
  const children = rows.filter((r) => r.parentId === id);
  return children.reduce((sum, child) => sum + 1 + countDescendants(rows, child.id), 0);
}

export function MenuManager({
  rows,
  pages,
}: {
  rows: MenuAdminRow[];
  pages: MenuPageOption[];
}) {
  const [items, setItems] = useState(rows);
  const [editor, setEditor] = useState<Editor>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<DropTarget>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [state, saveStructure] = useActionState(saveMenuStructureAction, initialState);

  const dirty = useMemo(
    () => JSON.stringify(structureOf(items)) !== JSON.stringify(structureOf(rows)),
    [items, rows],
  );

  function applyMove(next: MenuAdminRow[]) {
    setItems(inheritRootLocations(rows, next));
    setMoveError(null);
  }

  function handleDrop(targetId: string, position: DropPosition) {
    if (!dragId) return;
    const result = moveItem(items, dragId, targetId, position);
    if (result.rows === null) setMoveError(result.error);
    else applyMove(result.rows);
    setDragId(null);
    setDrop(null);
  }

  function dropPositionFor(event: DragEvent<HTMLElement>, targetId: string): DropPosition {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    if (ratio < 0.3) return "before";
    if (ratio > 0.7 || !canAddChild(items, targetId)) return ratio < 0.5 ? "before" : "after";
    return "inside";
  }

  const editingRow = editor?.mode === "edit" ? items.find((r) => r.id === editor.id) ?? null : null;
  const editorParentId =
    editor?.mode === "create" ? editor.parentId : (editingRow?.parentId ?? null);
  const editorParent = editorParentId ? items.find((r) => r.id === editorParentId) ?? null : null;

  function renderLevel(parentId: string | null, depth: number) {
    const siblings = siblingsOf(items, parentId);
    if (siblings.length === 0) return null;

    return (
      <ul className={depth === 1 ? "space-y-1" : "mt-1 space-y-1 border-l border-neutral-200 pl-4"}>
        {siblings.map((row, index) => {
          const href = resolveMenuHref(row);
          const broken = isBrokenMenuLink(row);
          const isDropTarget = drop?.id === row.id;
          const descendants = countDescendants(items, row.id);
          const allowChild = canAddChild(items, row.id);

          return (
            <li key={row.id}>
              <div
                draggable={!editor}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", row.id);
                  event.dataTransfer.effectAllowed = "move";
                  setDragId(row.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDrop(null);
                }}
                onDragOver={(event) => {
                  if (!dragId || dragId === row.id) return;
                  event.preventDefault();
                  setDrop({ id: row.id, position: dropPositionFor(event, row.id) });
                }}
                onDragLeave={() => setDrop((current) => (current?.id === row.id ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(row.id, drop?.id === row.id ? drop.position : "after");
                }}
                className={[
                  "flex flex-wrap items-center gap-2 rounded-md border bg-white px-3 py-2",
                  dragId === row.id ? "opacity-40" : "",
                  isDropTarget && drop.position === "inside"
                    ? "border-neutral-900 ring-2 ring-neutral-900/20"
                    : "border-neutral-200",
                  isDropTarget && drop.position === "before" ? "border-t-4 border-t-neutral-900" : "",
                  isDropTarget && drop.position === "after" ? "border-b-4 border-b-neutral-900" : "",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  title="Seret untuk memindahkan"
                  className="cursor-grab select-none text-neutral-400"
                >
                  ⋮⋮
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-neutral-900">{row.label}</span>
                    <Badge tone="muted">{LINK_TYPE_LABEL[row.linkType]}</Badge>
                    {!row.isVisible ? <Badge tone="muted">Tersembunyi</Badge> : null}
                    {broken ? <Badge tone="warn">Tujuan hilang</Badge> : null}
                    {row.openInNew ? <Badge tone="muted">Tab baru</Badge> : null}
                    {depth === 1
                      ? row.locations.map((loc) => (
                          <Badge key={loc}>{LOCATION_LABEL[loc]}</Badge>
                        ))
                      : null}
                  </div>
                  <p className="truncate font-mono text-xs text-neutral-500">
                    {broken
                      ? "Halaman tujuan sudah dihapus atau belum terbit — item ini tidak tampil di situs."
                      : (href ?? "— (judul tanpa tautan)")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyMove(moveSibling(items, row.id, -1))}
                    disabled={index === 0 || editor !== null}
                    aria-label={`Naikkan ${row.label}`}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMove(moveSibling(items, row.id, 1))}
                    disabled={index === siblings.length - 1 || editor !== null}
                    aria-label={`Turunkan ${row.label}`}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditor({ mode: "create", parentId: row.id })}
                    disabled={!allowChild || dirty || editor !== null}
                    title={
                      allowChild
                        ? "Tambah sub-menu di bawah item ini"
                        : `Sudah level ${MAX_MENU_DEPTH} — tidak bisa menambah sub-menu lagi`
                    }
                    className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                  >
                    + Tambah Sub-menu
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditor({ mode: "edit", id: row.id })}
                    disabled={dirty || editor !== null}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                  >
                    Ubah
                  </button>
                  <form action={deleteMenuItemAction}>
                    <input type="hidden" name="id" value={row.id} />
                    {dirty || editor !== null ? null : (
                      <ConfirmSubmit
                        message={
                          descendants > 0
                            ? `Hapus "${row.label}" beserta ${descendants} sub-menunya?`
                            : `Hapus "${row.label}"?`
                        }
                        className="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        Hapus
                      </ConfirmSubmit>
                    )}
                  </form>
                </div>
              </div>
              {renderLevel(row.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditor({ mode: "create", parentId: null })}
            disabled={dirty || editor !== null}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            + Tambah menu utama
          </button>
          <p className="text-xs text-neutral-500">
            Seret ke tengah item untuk menjadikannya sub-menu, ke tepi atas/bawah untuk menyisipkan.
          </p>
        </div>

        {dirty ? (
          <form
            action={saveStructure}
            className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2"
          >
            <input type="hidden" name="structure" value={JSON.stringify(structureOf(items))} />
            <p className="flex-1 text-sm text-amber-900">
              Susunan menu berubah. Periksa pratinjau, lalu simpan.
            </p>
            <button
              type="button"
              onClick={() => {
                setItems(rows);
                setMoveError(null);
              }}
              className="rounded-md border border-amber-400 px-3 py-1.5 text-sm text-amber-900"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
            >
              Simpan susunan
            </button>
          </form>
        ) : null}

        <ErrorMessage error={moveError ?? state.error} />

        {editor ? (
          <MenuItemForm
            key={editor.mode === "edit" ? editor.id : `new-${editor.parentId ?? "root"}`}
            item={editingRow}
            parentId={editorParentId}
            parentLabel={editorParent?.label ?? null}
            depth={editorParentId ? depthOf(items, editorParentId) + 1 : 1}
            pages={pages}
            onCancel={() => setEditor(null)}
          />
        ) : null}

        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Belum ada item menu. Situs memakai menu bawaan sampai item pertama dibuat.
          </p>
        ) : (
          renderLevel(null, 1)
        )}
      </div>

      <MenuPreview rows={items} />
    </div>
  );
}
