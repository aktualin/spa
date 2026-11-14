"use client";

import Link from "next/link";

import type { NavHighlight, NavLink } from "@/data/content";

/**
 * Kartu highlight mega menu (gambar + badge + eyebrow + label). Versi
 * desktop & mobile identik kecuali ukuran gambar dan padding tautan
 * (`compact` = mobile).
 */
export function NavHighlightCard({
  highlight,
  onNavigate,
  compact = false,
}: {
  highlight: NavHighlight;
  onNavigate: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={highlight.href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-sm ${
        compact ? "py-1 " : ""
      }focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa`}
    >
      <span
        className={`relative ${
          compact ? "h-12 w-12" : "h-14 w-14"
        } shrink-0 overflow-hidden bg-base-200`}
      >
        <img
          src={highlight.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {highlight.badge ? (
          <span className="absolute left-0 top-0 bg-base-100 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.14em] text-cocoa">
            {highlight.badge}
          </span>
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col">
        {highlight.eyebrow ? (
          <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-cocoa/75">
            {highlight.eyebrow}
          </span>
        ) : null}
        <span className="text-[0.875rem] text-cocoa group-hover:text-ink">
          {highlight.label}
        </span>
      </span>
    </Link>
  );
}

/** Tautan "lihat semua" di kaki panel; kelas pembungkus beda antar versi. */
export function NavFooterLink({
  link,
  onNavigate,
  className,
}: {
  link: NavLink;
  onNavigate: () => void;
  className: string;
}) {
  return (
    <div className={className}>
      <Link
        href={link.href}
        onClick={onNavigate}
        className="text-[0.8125rem] text-cocoa/75 underline decoration-tan underline-offset-4 transition-colors hover:text-ink"
      >
        {link.label} →
      </Link>
    </div>
  );
}