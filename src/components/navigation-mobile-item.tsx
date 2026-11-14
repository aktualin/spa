"use client";

import Link from "next/link";

import type { NavMegaGroup, NavPrimaryItem } from "@/data/content";
import { ChevronDown, ExternalLink } from "./icons";
import { MobileGroup } from "./navigation-mobile-group";

const itemLinkClass =
  "flex items-center justify-between py-3.5 text-[1rem] text-cocoa/90 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cocoa";

/** Satu baris menu mobile: tautan biasa, tautan eksternal, atau accordion. */
export function MobileNavItem({
  item,
  group,
  isOpen,
  onToggle,
  onNavigate,
}: {
  item: NavPrimaryItem;
  /** null = item biasa tanpa mega group. */
  group: NavMegaGroup | null;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (!group) {
    /* External links open in a new tab — never `next/link`. */
    if (item.external) {
      return (
        <li className="m-0 border-b border-tan/40">
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className={itemLinkClass}
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
      <li className="m-0 border-b border-tan/40">
        <Link href={item.href} onClick={onNavigate} className={itemLinkClass}>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="m-0 border-b border-tan/40">
      <button
        type="button"
        onClick={onToggle}
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
          <MobileGroup group={group} onNavigate={onNavigate} />
        </div>
      )}
    </li>
  );
}