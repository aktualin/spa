"use client";

import { siblingsOf } from "@/lib/domain/menu";

import type { MenuAdminRow } from "../actions/menu";
import type { Editor, MenuDnd } from "./menu-manager.constants";
import { MenuRowItem } from "./menu-manager-row";

/** Satu level daftar menu (rekursif untuk sub-menu). */
export function MenuLevel({
  parentId,
  depth,
  items,
  editor,
  dirty,
  applyMove,
  setEditor,
  dnd,
}: {
  parentId: string | null;
  depth: number;
  items: MenuAdminRow[];
  editor: Editor;
  dirty: boolean;
  applyMove: (next: MenuAdminRow[]) => void;
  setEditor: (editor: Editor) => void;
  dnd: MenuDnd;
}) {
  const siblings = siblingsOf(items, parentId);
  if (siblings.length === 0) return null;

  return (
    <ul className={depth === 1 ? "space-y-1" : "mt-1 space-y-1 border-l border-neutral-200 pl-4"}>
      {siblings.map((row, index) => (
        <MenuRowItem
          key={row.id}
          row={row}
          index={index}
          siblingCount={siblings.length}
          depth={depth}
          items={items}
          editor={editor}
          dirty={dirty}
          applyMove={applyMove}
          setEditor={setEditor}
          dnd={dnd}
        />
      ))}
    </ul>
  );
}