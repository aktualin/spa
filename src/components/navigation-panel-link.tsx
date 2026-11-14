"use client";

import Link from "next/link";

import type { NavLink } from "@/data/content";

/* Tautan kolom mega menu; tautan bertarget tab baru tidak boleh lewat next/link. */
export function PanelLink({
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