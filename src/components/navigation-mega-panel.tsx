"use client";

import type { NavMegaGroup } from "@/data/content";
import { NavFooterLink, NavHighlightCard } from "./navigation-highlight";
import { PanelLink } from "./navigation-panel-link";

/**
 * The desktop dropdown panel: link columns, promo cards and an optional
 * "see everything" link.
 */
export function MegaPanel({
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
            <NavHighlightCard key={h.label} highlight={h} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {group.footerLink && (
        <NavFooterLink
          link={group.footerLink}
          onNavigate={onNavigate}
          className="border-t border-tan/70 px-6 py-3"
        />
      )}
    </div>
  );
}