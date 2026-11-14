"use client";

import { canAddChild } from "@/lib/domain/menu";

import type { MenuAdminRow } from "../actions/menu";
import { RowActions } from "./menu-manager-actions";
import { countDescendants, type Editor, type MenuDnd } from "./menu-manager.constants";
import { MenuLevel } from "./menu-manager-level";
import { RowLabel } from "./menu-manager-row-label";

/** Satu baris item menu: drag-and-drop, label/badge, dan tombol aksi. */
export function MenuRowItem({
  row,
  index,
  siblingCount,
  depth,
  items,
  editor,
  dirty,
  applyMove,
  setEditor,
  dnd,
}: {
  row: MenuAdminRow;
  index: number;
  siblingCount: number;
  depth: number;
  items: MenuAdminRow[];
  editor: Editor;
  dirty: boolean;
  applyMove: (next: MenuAdminRow[]) => void;
  setEditor: (editor: Editor) => void;
  dnd: MenuDnd;
}) {
  const { dragId, drop, setDragId, setDrop, handleDrop, dropPositionFor } = dnd;
  const isDropTarget = drop?.id === row.id;
  const descendants = countDescendants(items, row.id);
  const allowChild = canAddChild(items, row.id);

  return (
    <li>
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

        <RowLabel row={row} depth={depth} />

        <RowActions
          row={row}
          index={index}
          siblingCount={siblingCount}
          items={items}
          editor={editor}
          dirty={dirty}
          descendants={descendants}
          allowChild={allowChild}
          applyMove={applyMove}
          setEditor={setEditor}
        />
      </div>
      <MenuLevel
        parentId={row.id}
        depth={depth + 1}
        items={items}
        editor={editor}
        dirty={dirty}
        applyMove={applyMove}
        setEditor={setEditor}
        dnd={dnd}
      />
    </li>
  );
}