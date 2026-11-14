"use client";

import Link from "next/link";

import { WhatsApp } from "./icons";
import { MobileNavItem } from "./navigation-mobile-item";
import type { MobileDrawerProps } from "./navigation-types";

export { MobileToggle } from "./navigation-mobile-toggle";

/**
 * Mobile menu — a panel of its own that scrolls inside the viewport,
 * so nothing gets cut off on short screens. The call-to-action bar is
 * pinned below the scroll area so it is always reachable.
 */
export function MobileDrawer({
  mobile,
  bookNow,
  bookNowHref,
  whatsappHref,
  fabAria,
  openGroup,
  setOpenGroup,
  onClose,
  panelRef,
}: MobileDrawerProps) {
  return (
    <div
      id="mobile-navigation"
      ref={panelRef}
      className="kama-drawer fixed inset-x-0 top-[var(--kama-header-h)] bottom-0 z-40 flex flex-col bg-base-100 xl:hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="container-kama py-3">
          <ul className="m-0 list-none p-0">
            {mobile.primary.map((item) => {
              const group = item.mega ? mobile.megaGroups[item.mega] : null;
              const isOpen = group ? openGroup === group.id : false;
              return (
                <MobileNavItem
                  key={group ? group.id : item.label}
                  item={item}
                  group={group}
                  isOpen={isOpen}
                  onToggle={() => group && setOpenGroup(isOpen ? null : group.id)}
                  onNavigate={onClose}
                />
              );
            })}
          </ul>
        </div>
      </div>

      {/* Call to action — always visible, no scrolling needed. */}
      <div className="border-t border-tan/70 bg-base-100/95 backdrop-blur-sm">
        <div className="container-kama flex items-center gap-3 py-3">
          {bookNow && bookNowHref ? (
            <Link
              href={bookNowHref}
              onClick={onClose}
              className="btn btn-primary flex-1 justify-center py-3 text-[0.9375rem]"
            >
              {bookNow}
            </Link>
          ) : null}
          {whatsappHref ? (
            <a
              href={whatsappHref}
              data-wa-context="default"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={fabAria}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-cocoa/50 text-cocoa transition-colors hover:bg-cocoa/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa"
            >
              <WhatsApp className="h-5 w-5 text-[#25d366]" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}