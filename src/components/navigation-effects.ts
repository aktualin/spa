"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { SetOpenGroup } from "./navigation-types";

type SetMobileOpen = Dispatch<SetStateAction<boolean>>;

/** Bayangan header muncul setelah halaman digulir lebih dari 24px. */
export function useScrollShadow() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrolled;
}

/* Navigating away closes whatever is open — otherwise the menu would still
   be open (and the page still frozen) on the next route. */
export function useCloseOnNavigate(
  pathname: string,
  setMobileOpen: SetMobileOpen,
  setOpenGroup: SetOpenGroup,
  clearTimers: () => void,
) {
  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
    clearTimers();
  }, [pathname]);
}

/* Escape closes the mobile menu. */
export function useMobileEscape(
  mobileOpen: boolean,
  setMobileOpen: SetMobileOpen,
  setOpenGroup: SetOpenGroup,
) {
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setOpenGroup(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);
}

/* Growing past the `xl` breakpoint switches to the desktop navigation. */
export function useDesktopBreakpoint(
  setMobileOpen: SetMobileOpen,
  setOpenGroup: SetOpenGroup,
  clearTimers: () => void,
) {
  useEffect(() => {
    const query = window.matchMedia("(min-width: 80rem)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
        setOpenGroup(null);
        clearTimers();
      }
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
}