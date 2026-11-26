"use client";

import Link from "next/link";

import type { NavPrimaryItem } from "@/data/content";
import { isNavLinkActive } from "@/lib/domain/nav-active";
import { ExternalLink } from "./icons";
import { linkActive, linkBase, linkIdle } from "./navigation-styles";

/** Item nav desktop tanpa mega: tautan biasa (dengan state aktif) atau eksternal. */
export function DesktopNavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavPrimaryItem;
  pathname: string;
  onNavigate: () => void;
}) {
  if (item.external) {
    /* External links open in a new tab — never `next/link`. */
    return (
      <li className="m-0 flex flex-col justify-center">
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className={`${linkBase} ${linkIdle}`}
        >
          {item.label}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </li>
    );
  }

  const active = isNavLinkActive(pathname, item.href);
  return (
    <li className="m-0 flex flex-col justify-center">
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`${linkBase} ${active ? linkActive : linkIdle}`}
      >
        {item.label}
      </Link>
    </li>
  );
}