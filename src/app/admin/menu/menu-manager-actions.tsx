"use client";

import { MAX_MENU_DEPTH, moveSibling } from "@/lib/domain/menu";

import { deleteMenuItemAction, type MenuAdminRow } from "../actions/menu";
import { ConfirmSubmit } from "../settings/_components/form-ui";
import type { Editor } from "./menu-manager.constants";

/** Tombol baris item menu: naik/turun, tambah sub-menu, ubah, hapus. */
export function RowActions({
  row,
  index,
  siblingCount,
  items,
  editor,
  dirty,
  descendants,
  allowChild,
  applyMove,
  setEditor,
}: {
  row: MenuAdminRow;
  index: number;
  siblingCount: number;
  items: MenuAdminRow[];
  editor: Editor;
  dirty: boolean;
  descendants: number;
  allowChild: boolean;
  applyMove: (next: MenuAdminRow[]) => void;
  setEditor: (editor: Editor) => void;
}) {
  return (
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
        disabled={index === siblingCount - 1 || editor !== null}
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
  );
}