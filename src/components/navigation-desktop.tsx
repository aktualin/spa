"use client";

import Link from "next/link";

import { ExternalLink } from "./icons";
import { DesktopMegaItem } from "./navigation-desktop-item";
import { linkBase } from "./navigation-styles";
import type { DesktopNavProps } from "./navigation-types";

/** Navigasi desktop (xl ke atas) beserta tombol Book Now. */
export function DesktopNav({
  header,
  bookNow,
  bookNowHref,
  openGroup,
  setOpenGroup,
  hover,
  panelRef,
  triggerRefs,
}: DesktopNavProps) {
  return (
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

          return (
            <DesktopMegaItem
              key={group.id}
              item={item}
              group={group}
              isOpen={isOpen}
              onToggle={() => {
                hover.clearTimers();
                setOpenGroup(isOpen ? null : group.id);
              }}
              onArrowDown={() => {
                hover.clearTimers();
                setOpenGroup(group.id);
              }}
              onNavigate={() => setOpenGroup(null)}
              hover={hover}
              panelRef={panelRef}
              triggerRef={(node) => {
                triggerRefs.current[group.id] = node;
              }}
            />
          );
        })}
      </ul>

      {/* CTA */}
      {bookNow && bookNowHref ? (
        <Link
          href={bookNowHref}
          className="btn btn-primary ml-4 shrink-0 whitespace-nowrap px-6 py-3 text-[0.9375rem]"
        >
          {bookNow}
        </Link>
      ) : null}
    </div>
  );
}