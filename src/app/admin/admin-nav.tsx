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

  return (
    <div className="space-y-3">
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
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-800">
              <span>{group.label}</span>
              <span aria-hidden className="text-neutral-400 transition group-open:rotate-90">
                ›
              </span>
            </summary>

            <ul className="mt-0.5 space-y-0.5">
              {group.modules.map((m) => (
                <li key={m.no}>
                  <ModuleLink module={m} activeHref={activeHref} />
                  {m.ready && m.children?.length ? (
                    <ul className="mb-1 ml-3 border-l border-neutral-200 pl-2">
                      {m.children.map((child) => {
                        const childActive =
                          child.href === activeHref ||
                          isUnderPath(pathname, normalizeAdminPath(child.href));
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={childActive ? "page" : undefined}
                              className={`block rounded-md px-3 py-1.5 text-xs transition ${
                                childActive
                                  ? "bg-neutral-900 text-white"
                                  : "text-neutral-600 hover:bg-neutral-100"
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
        className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-neutral-400"
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
      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
        active
          ? "bg-neutral-900 font-medium text-white"
          : "text-neutral-700 hover:bg-neutral-100"
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
    <p className="mb-4 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
      <span className="font-medium text-neutral-800">Tampil di situs: </span>
      {hint}
    </p>
  );
}
