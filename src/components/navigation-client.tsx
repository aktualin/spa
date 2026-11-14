"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { useDropdownDismiss } from "./navigation-dropdown-dismiss";
import {
  useCloseOnNavigate,
  useDesktopBreakpoint,
  useMobileEscape,
} from "./navigation-effects";
import { NavigationHeader } from "./navigation-header";
import { useHoverIntent } from "./navigation-hover-intent";
import { MobileDrawer } from "./navigation-mobile";
import { useBodyScrollLock } from "./navigation-scroll-lock";
import type { NavigationClientProps } from "./navigation-types";

export function NavigationClient({
  header,
  mobile,
  bookNow,
  bookNowHref,
  whatsappHref,
  brand,
  navAria,
  navOpen,
  navClose,
  fabAria,
}: NavigationClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  /* Latest route, readable from event handlers and cleanup functions. */
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const hover = useHoverIntent(setOpenGroup);
  useBodyScrollLock(mobileOpen, pathnameRef);
  useCloseOnNavigate(pathname, setMobileOpen, setOpenGroup, hover.clearTimers);
  useMobileEscape(mobileOpen, setMobileOpen, setOpenGroup);
  useDropdownDismiss(openGroup, setOpenGroup, {
    headerRef,
    panelRef,
    mobilePanelRef,
    triggerRefs,
  });
  useDesktopBreakpoint(setMobileOpen, setOpenGroup, hover.clearTimers);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <NavigationHeader
        headerRef={headerRef}
        navAria={navAria}
        pathname={pathname}
        brand={brand}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen((open) => !open)}
        navOpen={navOpen}
        navClose={navClose}
        desktop={{
          header,
          bookNow,
          bookNowHref,
          openGroup,
          setOpenGroup,
          hover,
          panelRef,
          triggerRefs,
        }}
      />

      {mobileOpen && (
        <MobileDrawer
          mobile={mobile}
          bookNow={bookNow}
          bookNowHref={bookNowHref}
          whatsappHref={whatsappHref}
          fabAria={fabAria}
          openGroup={openGroup}
          setOpenGroup={setOpenGroup}
          onClose={closeMobileMenu}
          panelRef={mobilePanelRef}
        />
      )}

      {/* Spacer: the header is fixed, so page content needs room for it.
          The height comes from the same token as the header itself. */}
      <div className="h-[var(--kama-header-h)]" aria-hidden="true" />
    </>
  );
}