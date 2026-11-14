"use client";

import { useState, type DragEvent } from "react";

import { canAddChild, inheritRootLocations, moveItem, type DropPosition } from "@/lib/domain/menu";

import type { MenuAdminRow } from "../actions/menu";
import type { DropTarget, MenuDnd } from "./menu-manager.constants";

/** State & handler drag-and-drop susunan menu. */
export function useMenuDnd(
  items: MenuAdminRow[],
  rows: MenuAdminRow[],
  setItems: (next: MenuAdminRow[]) => void,
  setMoveError: (error: string | null) => void,
) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<DropTarget>(null);

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

  const dnd: MenuDnd = { dragId, drop, setDragId, setDrop, handleDrop, dropPositionFor };
  return { dnd, applyMove };
}