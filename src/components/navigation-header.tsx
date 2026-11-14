"use client";

import Link from "next/link";
import type { RefObject } from "react";

import { Logo, type LogoBrand } from "./logo";
import { DesktopNav } from "./navigation-desktop";
import { useScrollShadow } from "./navigation-effects";
import { MobileToggle } from "./navigation-mobile";
import type { DesktopNavProps } from "./navigation-types";

/** Bar header tetap: logo, toggle mobile, dan navigasi desktop. */
export function NavigationHeader({
  headerRef,
  navAria,
  pathname,
  brand,
  mobileOpen,
  onToggleMobile,
  navOpen,
  navClose,
  desktop,
}: {
  headerRef: RefObject<HTMLElement | null>;
  navAria: string;
  pathname: string;
  brand?: LogoBrand;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  navOpen: string;
  navClose: string;
  desktop: DesktopNavProps;
}) {
  const scrolled = useScrollShadow();

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 h-[var(--kama-header-h)] border-b border-tan/70 bg-base-100/95 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled ? "shadow-[0_10px_30px_-24px_rgba(42,22,4,0.6)]" : ""
      }`}
    >
      <nav
        className="container-kama flex h-full items-center justify-between"
        aria-label={navAria}
      >
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cocoa"
        >
          <Logo brand={brand} />
        </Link>

        <MobileToggle
          open={mobileOpen}
          onToggle={onToggleMobile}
          openLabel={navOpen}
          closeLabel={navClose}
        />

        {/* Desktop navigation — stretched to the full header height so the
            mega panel starts exactly at the header's bottom edge. */}
        <DesktopNav {...desktop} />
      </nav>
    </header>
  );
}