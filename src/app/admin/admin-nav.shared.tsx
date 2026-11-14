"use client";

import Link from "next/link";

import type { AdminModule } from "./modules";

export type Group = { id: string; label: string; modules: AdminModule[] };

/** Kunci localStorage untuk kelompok yang sengaja diciutkan admin. */
export const COLLAPSED_KEY = "kama.admin.sidebar.collapsed";

export const itemClass =
  "flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa";

export function ModuleLink({
  module: m,
  activeHref,
}: {
  module: AdminModule;
  activeHref: string | null;
}) {
  if (!m.ready) {
    return (
      <span
        aria-disabled="true"
        title="Modul ini belum dibangun"
        className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-[13px] text-neutral-400"
      >
        <span>{m.label}</span>
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
          segera
        </span>
      </span>
    );
  }

  const active = m.href === activeHref;
  return (
    <Link
      href={m.href}
      title={m.hint}
      aria-current={active ? "page" : undefined}
      className={`${itemClass} ${
        active
          ? "bg-cocoa font-medium text-white shadow-sm"
          : "text-neutral-700 hover:bg-cream-soft hover:text-ink"
      }`}
    >
      <span>{m.label}</span>
    </Link>
  );
}