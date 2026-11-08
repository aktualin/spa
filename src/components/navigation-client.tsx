"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";
import { ChevronDown, Close, ExternalLink, WhatsApp } from "./icons";
import type { NavLink, NavMegaGroup } from "@/data/content";
import type { NavData } from "@/lib/domain/menu-nav";

/* Owner of the page scroll lock — only one navigation may hold it. */
let bodyLockToken: object | null = null;

/* Hover intent: a short delay before opening, a slightly longer one before
   closing, so the panel does not flicker while the pointer travels. */
const OPEN_DELAY = 110;
const CLOSE_DELAY = 200;

/* Shared link styling for the desktop bar. */
const linkBase =
  "flex items-center gap-1.5 rounded-sm px-3 py-2 text-[0.9375rem] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa";

/* Tautan kolom mega menu; tautan bertarget tab baru tidak boleh lewat next/link. */
function PanelLink({
  link,
  onNavigate,
  className,
}: {
  link: NavLink;
  onNavigate: () => void;
  className: string;
}) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} onClick={onNavigate} className={className}>
      {link.label}
    </Link>
  );
}

/**
 * The desktop dropdown panel: link columns, promo cards and an optional
 * "see everything" link.
 */
function MegaPanel({
  group,
  onNavigate,
}: {
  group: NavMegaGroup;
  onNavigate: () => void;
}) {
  const wide = group.panel === "wide";

  return (
    <div className="kama-dropdown-panel w-[38rem] max-w-[calc(100vw-2rem)]">
      <div className="flex flex-wrap gap-x-12 gap-y-6 p-6">
        {group.columns.map((col, colIndex) => (
          <div key={`${colIndex}-${col.title}`} className="min-w-[11rem]">
            {col.title ? <p className="eyebrow text-cocoa/75">{col.title}</p> : null}
            <ul className="m-0 list-none space-y-0.5 p-0">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`} className="m-0">
                  <PanelLink
                    link={link}
                    onNavigate={onNavigate}
                    className="block rounded-sm py-1.5 text-[0.9375rem] text-cocoa/85 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {group.highlights.length > 0 && (
        <div
          className={`grid gap-4 border-t border-tan/70 bg-cream/50 px-6 py-5 ${
            wide ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {group.highlights.map((h) => (
            <Link
              key={h.label}
              href={h.href}
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-base-200">
                <img
                  src={h.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-0 top-0 bg-base-100 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.14em] text-cocoa">
                  {h.badge}
                </span>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-cocoa/75">
                  {h.eyebrow}
                </span>
                <span className="text-[0.875rem] text-cocoa group-hover:text-ink">
                  {h.label}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {group.footerLink && (
        <div className="border-t border-tan/70 px-6 py-3">
          <Link
            href={group.footerLink.href}
            onClick={onNavigate}
            className="text-[0.8125rem] text-cocoa/75 underline decoration-tan underline-offset-4 transition-colors hover:text-ink"
          >
            {group.footerLink.label} →
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * The mobile accordion body: the same content, stacked and indented.
 */
function MobileGroup({
  group,
  onNavigate,
}: {
  group: NavMegaGroup;
  onNavigate: () => void;
}) {
  return (
    <div className="pb-4">
      {group.columns.map((col, colIndex) => (
        <div key={`${colIndex}-${col.title}`} className="mb-3">
          {col.title ? (
            <p className="eyebrow px-3 pt-2 text-cocoa/75">{col.title}</p>
          ) : null}
          <ul className="m-0 list-none p-0">
            {col.links.map((link) => (
              <li key={`${col.title}-${link.label}`} className="m-0">
                <PanelLink
                  link={link}
                  onNavigate={onNavigate}
                  className="block rounded-sm px-3 py-2.5 text-[0.9375rem] text-cocoa/85 transition-colors hover:bg-cocoa/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa"
                />
              </li>
            ))}
          </ul>
        </div>
      ))}

      {group.highlights.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-tan/50 px-3 pt-3">
          {group.highlights.map((h) => (
            <Link
              key={h.label}
              href={h.href}
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-sm py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-base-200">
                <img
                  src={h.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-0 top-0 bg-base-100 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.14em] text-cocoa">
                  {h.badge}
                </span>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-cocoa/75">
                  {h.eyebrow}
                </span>
                <span className="text-[0.875rem] text-cocoa group-hover:text-ink">
                  {h.label}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {group.footerLink && (
        <div className="px-3 pt-2">
          <Link
            href={group.footerLink.href}
            onClick={onNavigate}
            className="text-[0.8125rem] text-cocoa/75 underline decoration-tan underline-offset-4 transition-colors hover:text-ink"
          >
            {group.footerLink.label} →
          </Link>
        </div>
      )}
    </div>
  );
}

export function NavigationClient({
  header,
  mobile,
  bookNow,
  whatsappHref,
}: {
  header: NavData;
  mobile: NavData;
  bookNow: string;
  /** Tautan wa.me (nomor + template "default") — dibangun di server. */
  whatsappHref: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Latest route, readable from event handlers and cleanup functions. */
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Freeze the page behind the mobile menu. `position: fixed` is used instead
     of `overflow: hidden` because iOS Safari keeps scrolling with the latter.
     The scroll offset is restored when the menu closes. */
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

  /* Navigating away closes whatever is open — otherwise the menu would still
     be open (and the page still frozen) on the next route. */
  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
    clearTimers();
  }, [pathname]);

  /* Escape closes the mobile menu. */
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

  /* Escape closes the open dropdown and returns the focus to its trigger.
     Clicking outside of the header closes it as well. Clicks on the toggles
     themselves are left to their handler. */
  useEffect(() => {
    if (!openGroup) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenGroup(null);
      triggerRefs.current[openGroup]?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const inHeader = headerRef.current?.contains(target) ?? false;
      const inPanel = panelRef.current?.contains(target) ?? false;
      const inMobilePanel = mobilePanelRef.current?.contains(target) ?? false;
      if (!inHeader && !inPanel && !inMobilePanel) setOpenGroup(null);
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openGroup]);

  /* Growing past the `xl` breakpoint switches to the desktop navigation. */
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

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 h-[var(--kama-header-h)] border-b border-tan/70 bg-base-100/95 backdrop-blur-sm transition-shadow duration-300 ${
          scrolled ? "shadow-[0_10px_30px_-24px_rgba(42,22,4,0.6)]" : ""
        }`}
      >
        <nav
          className="container-kama flex h-full items-center justify-between"
          aria-label="Global"
        >
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cocoa"
          >
            <Logo className="h-[22px] w-auto" />
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-cocoa/50 text-cocoa transition-colors hover:bg-cocoa/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa xl:hidden"
          >
            {mobileOpen ? (
              <Close className="h-5 w-5" aria-hidden="true" />
            ) : (
              <span
                className="flex h-4 w-5 flex-col justify-center gap-[4px]"
                aria-hidden="true"
              >
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
              </span>
            )}
          </button>

          {/* Desktop navigation — stretched to the full header height so the
              mega panel starts exactly at the header's bottom edge. */}
          <div className="hidden xl:flex xl:items-stretch xl:self-stretch">
            <ul className="m-0 flex list-none items-stretch gap-0.5 p-0">
              {header.primary.map((item) => {
                if (!item.mega) {
                  /* External links open in a new tab — never `next/link`. */
                  if (item.external) {
                    return (
                      <li key={item.label} className="m-0 flex flex-col justify-center">
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpenGroup(null)}
                          className={`${linkBase} text-cocoa/85 hover:bg-cocoa/5 hover:text-ink`}
                        >
                          {item.label}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={item.label} className="m-0 flex flex-col justify-center">
                      <Link
                        href={item.href}
                        onClick={() => setOpenGroup(null)}
                        className={`${linkBase} text-cocoa/85 hover:bg-cocoa/5 hover:text-ink`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                const group = header.megaGroups[item.mega];
                const isOpen = openGroup === group.id;
                const panelId = `desktop-group-${group.id}`;

                return (
                  <li
                    key={group.id}
                    className="relative m-0 flex flex-col justify-center"
                    onMouseEnter={() => scheduleOpen(group.id)}
                    onMouseLeave={scheduleClose}
                  >
                    <button
                      type="button"
                      ref={(node) => {
                        triggerRefs.current[group.id] = node;
                      }}
                      onClick={() => {
                        clearTimers();
                        setOpenGroup(isOpen ? null : group.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          clearTimers();
                          setOpenGroup(group.id);
                        }
                      }}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={panelId}
                      className={`${linkBase} ${
                        isOpen
                          ? "bg-cocoa/8 text-ink"
                          : "text-cocoa/85 hover:bg-cocoa/5 hover:text-ink"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        ref={panelRef}
                        className="absolute left-0 top-full z-50 max-h-[calc(100vh-var(--kama-header-h)-1rem)] overflow-y-auto border border-tan/70 bg-base-100 shadow-[0_24px_48px_-28px_rgba(42,22,4,0.55)]"
                      >
                        <MegaPanel
                          group={group}
                          onNavigate={() => setOpenGroup(null)}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* CTA */}
            <Link
              href="/contact"
              className="btn btn-primary ml-4 shrink-0 whitespace-nowrap px-6 py-3 text-[0.9375rem]"
            >
              {bookNow}
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile menu — a panel of its own that scrolls inside the viewport,
          so nothing gets cut off on short screens. The call-to-action bar is
          pinned below the scroll area so it is always reachable. */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          ref={mobilePanelRef}
          className="kama-drawer fixed inset-x-0 top-[var(--kama-header-h)] bottom-0 z-40 flex flex-col bg-base-100 xl:hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="container-kama py-3">
              <ul className="m-0 list-none p-0">
                {mobile.primary.map((item) => {
                  if (!item.mega) {
                    /* External links open in a new tab — never `next/link`. */
                    if (item.external) {
                      return (
                        <li key={item.label} className="m-0 border-b border-tan/40">
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={closeMobileMenu}
                            className="flex items-center justify-between py-3.5 text-[1rem] text-cocoa/90 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cocoa"
                          >
                            {item.label}
                            <ExternalLink
                              className="h-3.5 w-3.5 shrink-0 opacity-60"
                              aria-hidden="true"
                            />
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={item.label} className="m-0 border-b border-tan/40">
                        <Link
                          href={item.href}
                          onClick={closeMobileMenu}
                          className="flex items-center justify-between py-3.5 text-[1rem] text-cocoa/90 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cocoa"
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }

                  const group = mobile.megaGroups[item.mega];
                  const isOpen = openGroup === group.id;

                  return (
                    <li key={group.id} className="m-0 border-b border-tan/40">
                      <button
                        type="button"
                        onClick={() => setOpenGroup(isOpen ? null : group.id)}
                        aria-expanded={isOpen}
                        aria-controls={`mobile-group-${group.id}`}
                        className="flex w-full items-center justify-between py-3.5 text-[1rem] text-cocoa/90 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cocoa"
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div id={`mobile-group-${group.id}`}>
                          <MobileGroup
                            group={group}
                            onNavigate={closeMobileMenu}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Call to action — always visible, no scrolling needed. */}
          <div className="border-t border-tan/70 bg-base-100/95 backdrop-blur-sm">
            <div className="container-kama flex items-center gap-3 py-3">
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="btn btn-primary flex-1 justify-center py-3 text-[0.9375rem]"
              >
                {bookNow}
              </Link>
              <a
                href={whatsappHref}
                data-wa-context="default"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat via WhatsApp"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-cocoa/50 text-cocoa transition-colors hover:bg-cocoa/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa"
              >
                <WhatsApp className="h-5 w-5 text-[#25d366]" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Spacer: the header is fixed, so page content needs room for it.
          The height comes from the same token as the header itself. */}
      <div className="h-[var(--kama-header-h)]" aria-hidden="true" />
    </>
  );
}
