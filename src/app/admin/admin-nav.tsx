"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { isUnderPath, normalizeAdminPath } from "@/lib/domain/admin-access";

import {
  activeHrefForPath,
  moduleHintForPath,
  type AdminModule,
} from "./modules";

type Group = { id: string; label: string; modules: AdminModule[] };

/** Kunci localStorage untuk kelompok yang sengaja diciutkan admin. */
const COLLAPSED_KEY = "kama.admin.sidebar.collapsed";

const itemClass =
  "flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa";

/**
 * Daftar modul sidebar: dikelompokkan, menandai halaman yang sedang dibuka,
 * dan tiap kelompok bisa diciutkan. Pilihan ciut disimpan di localStorage
 * supaya tidak kembali terbuka setiap pindah halaman.
 */
export function AdminNav({ groups }: { groups: Group[] }) {
  const pathname = normalizeAdminPath(usePathname() ?? "");
  const activeHref = activeHrefForPath(pathname);
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);

  // localStorage hanya ada di browser: baca setelah render pertama supaya
  // markup server dan klien tetap sama.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLLAPSED_KEY);
      if (raw) setCollapsed(JSON.parse(raw) as string[]);
    } catch {
      // Penyimpanan diblokir (mode privat) — sidebar tetap jalan, semua terbuka.
    }
  }, []);

  function toggle(id: string, open: boolean) {
    setCollapsed((prev) => {
      const next = open ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
      } catch {
        // Tidak bisa disimpan — perubahan tetap berlaku sampai halaman ditutup.
      }
      return next;
    });
  }

  const dashboardActive = pathname === "/admin";

  return (
    <div className="space-y-4">
      <Link
        href="/admin"
        aria-current={dashboardActive ? "page" : undefined}
        className={`${itemClass} font-medium ${
          dashboardActive
            ? "bg-cocoa text-white shadow-sm"
            : "text-neutral-700 hover:bg-cream-soft hover:text-ink"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <IconDashboard />
          Ringkasan
        </span>
      </Link>

      {groups.map((group) => {
        const hasActive = group.modules.some(
          (m) =>
            m.href === activeHref ||
            (m.children ?? []).some((c) => c.href === activeHref),
        );
        // Kelompok yang memuat halaman aktif selalu terbuka supaya penanda
        // "halaman ini" tidak tersembunyi di balik kelompok yang diciutkan.
        const open = hasActive || !collapsed.includes(group.id);

        return (
          <details
            key={group.id}
            open={open}
            onToggle={(e) => toggle(group.id, e.currentTarget.open)}
            className="group"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 transition-colors hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa">
              <span aria-hidden className="text-neutral-400 group-open:text-cocoa">
                <GroupIcon group={group.id} />
              </span>
              <span className="flex-1">{group.label}</span>
              <span
                aria-hidden
                className="text-neutral-300 transition-transform group-open:rotate-90"
              >
                <IconChevron />
              </span>
            </summary>

            <ul className="mt-1 space-y-0.5">
              {group.modules.map((m) => (
                <li key={m.no}>
                  <ModuleLink module={m} activeHref={activeHref} />
                  {m.ready && m.children?.length ? (
                    <ul className="mb-1 ml-3 space-y-0.5 border-l border-neutral-200 pl-2">
                      {m.children.map((child) => {
                        const childActive =
                          child.href === activeHref ||
                          isUnderPath(pathname, normalizeAdminPath(child.href));
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={childActive ? "page" : undefined}
                              className={`block rounded-lg px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa ${
                                childActive
                                  ? "bg-cream-soft font-medium text-cocoa"
                                  : "text-neutral-500 hover:bg-cream-soft/60 hover:text-ink"
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

function ModuleLink({
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

/**
 * Petunjuk satu kalimat di atas isi modul: konten yang diatur di halaman ini
 * tampil di mana pada situs publik. Berguna untuk training & serah terima.
 * Dashboard (`/admin`) dan halaman akun tidak punya petunjuk → tidak dirender.
 */
export function AdminModuleHint() {
  const pathname = usePathname() ?? "";
  const hint = moduleHintForPath(pathname);
  if (!hint) return null;

  return (
    <p className="mb-5 rounded-xl border border-neutral-200/80 bg-white px-4 py-2.5 text-xs text-neutral-500">
      <span className="font-medium text-neutral-700">Tampil di situs: </span>
      {hint}
    </p>
  );
}

const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconDashboard() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg {...iconProps} width={12} height={12}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function GroupIcon({ group }: { group: string }) {
  switch (group) {
    case "katalog":
      return (
        <svg {...iconProps}>
          <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
          <circle cx="7.5" cy="7.5" r="1.2" />
        </svg>
      );
    case "konten":
      return (
        <svg {...iconProps}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M9 9v11" />
        </svg>
      );
    case "struktur":
      return (
        <svg {...iconProps}>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    case "sistem":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      );
    default:
      return null;
  }
}
