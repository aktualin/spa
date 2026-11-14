"use client";

import { useEffect, useRef } from "react";

import type { HoverIntent, SetOpenGroup } from "./navigation-types";

/* Hover intent: a short delay before opening, a slightly longer one before
   closing, so the panel does not flicker while the pointer travels. */
const OPEN_DELAY = 110;
const CLOSE_DELAY = 200;

export function useHoverIntent(setOpenGroup: SetOpenGroup): HoverIntent {
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const scheduleOpen = (id: string) => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpenGroup(id), OPEN_DELAY);
  };

  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpenGroup(null), CLOSE_DELAY);
  };

  useEffect(() => clearTimers, []);

  return { clearTimers, scheduleOpen, scheduleClose };
}