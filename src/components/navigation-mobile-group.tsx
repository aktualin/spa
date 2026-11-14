"use client";

import type { NavMegaGroup } from "@/data/content";
import { NavFooterLink, NavHighlightCard } from "./navigation-highlight";
import { PanelLink } from "./navigation-panel-link";

/**
 * The mobile accordion body: the same content as the mega panel, stacked
 * and indented.
 */
export function MobileGroup({
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
            <NavHighlightCard
              key={h.label}
              highlight={h}
              onNavigate={onNavigate}
              compact
            />
          ))}
        </div>
      )}

      {group.footerLink && (
        <NavFooterLink
          link={group.footerLink}
          onNavigate={onNavigate}
          className="px-3 pt-2"
        />
      )}
    </div>
  );
}