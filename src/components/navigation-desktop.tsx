"use client";

import Link from "next/link";

import { isNavGroupActive } from "@/lib/domain/nav-active";
import { DesktopMegaItem } from "./navigation-desktop-item";
import { DesktopNavLink } from "./navigation-desktop-link";
import type { DesktopNavProps } from "./navigation-types";

/** Navigasi desktop (xl ke atas) beserta tombol Book Now. */
export function DesktopNav({
  header,
  bookNow,
  bookNowHref,
  pathname,
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
            return (
              <DesktopNavLink
                key={item.label}
                item={item}
                pathname={pathname}
                onNavigate={() => setOpenGroup(null)}
              />
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
              isActive={isNavGroupActive(pathname, item, group)}
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