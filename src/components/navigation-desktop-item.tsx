"use client";

import type { RefObject } from "react";

import type { NavMegaGroup, NavPrimaryItem } from "@/data/content";
import { ChevronDown } from "./icons";
import { MegaPanel } from "./navigation-mega-panel";
import { linkBase } from "./navigation-styles";
import type { HoverIntent } from "./navigation-types";

/** Satu item mega menu desktop: tombol pemicu + panel dropdown-nya. */
export function DesktopMegaItem({
  item,
  group,
  isOpen,
  onToggle,
  onArrowDown,
  onNavigate,
  hover,
  panelRef,
  triggerRef,
}: {
  item: NavPrimaryItem;
  group: NavMegaGroup;
  isOpen: boolean;
  onToggle: () => void;
  onArrowDown: () => void;
  onNavigate: () => void;
  hover: HoverIntent;
  panelRef: RefObject<HTMLDivElement | null>;
  triggerRef: (node: HTMLButtonElement | null) => void;
}) {
  const panelId = `desktop-group-${group.id}`;

  return (
    <li
      className="relative m-0 flex flex-col justify-center"
      onMouseEnter={() => hover.scheduleOpen(group.id)}
      onMouseLeave={hover.scheduleClose}
    >
      <button
        type="button"
        ref={triggerRef}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            onArrowDown();
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
          <MegaPanel group={group} onNavigate={onNavigate} />
        </div>
      )}
    </li>
  );
}