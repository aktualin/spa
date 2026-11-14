"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isUnderPath, normalizeAdminPath } from "@/lib/domain/admin-access";

import { GroupIcon, IconChevron } from "./admin-nav.icons";
import { ModuleLink, type Group } from "./admin-nav.shared";
import { moduleHintForPath } from "./modules";

/** Satu kelompok sidebar beserta daftar modul & sub-menunya. */
export function NavGroup({
  group,
  activeHref,
  pathname,
  open,
  onToggle,
}: {
  group: Group;
  activeHref: string | null;
  pathname: string;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  return (
    <details
      open={open}
      onToggle={(e) => onToggle(e.currentTarget.open)}
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