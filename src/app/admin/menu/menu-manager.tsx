"use client";

import { useActionState, useMemo, useState } from "react";

import { depthOf } from "@/lib/domain/menu";

import {
  saveMenuStructureAction,
  type MenuAdminRow,
  type MenuPageOption,
} from "../actions/menu";
import { ErrorMessage } from "../settings/_components/form-ui";
import { MenuItemForm } from "./menu-item-form";
import { MenuPreview } from "./menu-preview";
import { AddRootToolbar, StructureBanner } from "./menu-manager-banner";
import { initialState, structureOf, type Editor } from "./menu-manager.constants";
import { useMenuDnd } from "./menu-manager-dnd";
import { MenuLevel } from "./menu-manager-level";

export { LINK_TYPE_LABEL, LOCATION_LABEL } from "./menu-manager.constants";

export function MenuManager({
  rows,
  pages,
}: {
  rows: MenuAdminRow[];
  pages: MenuPageOption[];
}) {
  const [items, setItems] = useState(rows);
  const [editor, setEditor] = useState<Editor>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [state, saveStructure] = useActionState(saveMenuStructureAction, initialState);

  const dirty = useMemo(
    () => JSON.stringify(structureOf(items)) !== JSON.stringify(structureOf(rows)),
    [items, rows],
  );

  const { dnd, applyMove } = useMenuDnd(items, rows, setItems, setMoveError);

  const editingRow = editor?.mode === "edit" ? items.find((r) => r.id === editor.id) ?? null : null;
  const editorParentId =
    editor?.mode === "create" ? editor.parentId : (editingRow?.parentId ?? null);
  const editorParent = editorParentId ? items.find((r) => r.id === editorParentId) ?? null : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        <AddRootToolbar
          disabled={dirty || editor !== null}
          onAdd={() => setEditor({ mode: "create", parentId: null })}
        />

        {dirty ? (
          <StructureBanner
            items={items}
            saveStructure={saveStructure}
            onCancel={() => {
              setItems(rows);
              setMoveError(null);
            }}
          />
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
          <MenuLevel
            parentId={null}
            depth={1}
            items={items}
            editor={editor}
            dirty={dirty}
            applyMove={applyMove}
            setEditor={setEditor}
            dnd={dnd}
          />
        )}
      </div>

      <MenuPreview rows={items} />
    </div>
  );
}