"use client";

import { useEffect } from "react";

import type { NavRefs, SetOpenGroup } from "./navigation-types";

/* Escape closes the open dropdown and returns the focus to its trigger.
   Clicking outside of the header closes it as well. Clicks on the toggles
   themselves are left to their handler. */
export function useDropdownDismiss(
  openGroup: string | null,
  setOpenGroup: SetOpenGroup,
  refs: NavRefs,
) {
  useEffect(() => {
    if (!openGroup) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenGroup(null);
      refs.triggerRefs.current[openGroup]?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const inHeader = refs.headerRef.current?.contains(target) ?? false;
      const inPanel = refs.panelRef.current?.contains(target) ?? false;
      const inMobilePanel = refs.mobilePanelRef.current?.contains(target) ?? false;
      if (!inHeader && !inPanel && !inMobilePanel) setOpenGroup(null);
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openGroup]);
}