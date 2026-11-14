"use client";

import { useEffect } from "react";

/* Owner of the page scroll lock — only one navigation may hold it. */
let bodyLockToken: object | null = null;

/**
 * Freeze the page behind the mobile menu. `position: fixed` is used instead
 * of `overflow: hidden` because iOS Safari keeps scrolling with the latter.
 * The scroll offset is restored when the menu closes.
 */
export function useBodyScrollLock(
  mobileOpen: boolean,
  pathnameRef: { current: string },
) {
  useEffect(() => {
    if (!mobileOpen) return;

    const body = document.body;
    const scrollY = window.scrollY;
    const lockedPath = pathnameRef.current;
    const token = {};
    bodyLockToken = token;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      /* Another instance (a page kept in the router cache) may have taken
         over the lock in the meantime — only undo our own. */
      if (bodyLockToken !== token) return;

      bodyLockToken = null;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.paddingRight = previous.paddingRight;
      /* Only restore the scroll offset if the menu was closed on the same
         route — after a navigation the new page owns the scroll position. */
      if (pathnameRef.current === lockedPath) {
        window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
      }
    };
  }, [mobileOpen]);
}