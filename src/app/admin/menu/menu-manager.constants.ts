import type { DragEvent, Dispatch, SetStateAction } from "react";

import type { DropPosition, MenuLinkType, MenuLocation } from "@/lib/domain/menu";

import type { ActionState, MenuAdminRow } from "../actions/menu";

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

export type Editor = { mode: "create"; parentId: string | null } | { mode: "edit"; id: string } | null;
export type DropTarget = { id: string; position: DropPosition } | null;

/** State & callback drag-and-drop yang dioper ke tiap baris menu. */
export type MenuDnd = {
  dragId: string | null;
  drop: DropTarget;
  setDragId: (id: string | null) => void;
  setDrop: Dispatch<SetStateAction<DropTarget>>;
  handleDrop: (targetId: string, position: DropPosition) => void;
  dropPositionFor: (event: DragEvent<HTMLElement>, targetId: string) => DropPosition;
};

export const initialState: ActionState = { error: null };

export function structureOf(rows: readonly MenuAdminRow[]) {
  return rows
    .map((r) => ({ id: r.id, parentId: r.parentId, sortOrder: r.sortOrder }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function countDescendants(rows: readonly MenuAdminRow[], id: string): number {
  const children = rows.filter((r) => r.parentId === id);
  return children.reduce((sum, child) => sum + 1 + countDescendants(rows, child.id), 0);
}