"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { normalizeAdminPath } from "@/lib/domain/admin-access";

import { NavGroup } from "./admin-nav-group";
import { IconDashboard } from "./admin-nav.icons";
import { COLLAPSED_KEY, itemClass, type Group } from "./admin-nav.shared";
import { activeHrefForPath } from "./modules";

export { AdminModuleHint } from "./admin-nav-group";

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
          <NavGroup
            key={group.id}
            group={group}
            activeHref={activeHref}
            pathname={pathname}
            open={open}
            onToggle={(nextOpen) => toggle(group.id, nextOpen)}
          />
        );
      })}
    </div>
  );
}