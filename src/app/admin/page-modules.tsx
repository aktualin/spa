import Link from "next/link";

import type { GroupedModules } from "@/lib/domain/admin-access";

import type { AdminModule } from "./modules";

export function ModulesSection({ groups }: { groups: GroupedModules<AdminModule>[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold text-neutral-900">Modul</h2>
      <p className="mt-0.5 text-xs text-neutral-400">
        Dikelompokkan mengikuti alur kerja: katalog, konten, halaman, lalu
        pengaturan sistem.
      </p>
      {groups.map((group) => (
        <div key={group.id} className="mt-4">
          <div className="flex items-center gap-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {group.label}
            </h3>
            <span aria-hidden className="h-px flex-1 bg-neutral-200/80" />
          </div>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {group.modules.map((m) => (
              <li key={m.no}>
                {m.ready ? (
                  <Link
                    href={m.href}
                    className="group flex h-full flex-col rounded-xl border border-neutral-200/80 bg-white px-4 py-3 transition hover:border-cocoa/40 hover:shadow-sm"
                  >
                    <span className="text-[13px] font-medium text-neutral-800 group-hover:text-cocoa">
                      {m.label}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-neutral-400">
                      {m.hint}
                    </span>
                  </Link>
                ) : (
                  <span className="flex h-full flex-col rounded-xl border border-dashed border-neutral-200 px-4 py-3 text-[13px] text-neutral-400">
                    {m.label} (segera)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function SummaryErrorNote() {
  return (
    <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Ringkasan konten tidak dapat dimuat karena kesalahan database. Halaman
      dashboard tetap bisa digunakan.
    </p>
  );
}

export function ProgressFooter({ ready, total }: { ready: number; total: number }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-neutral-200/80 bg-white px-4 py-3">
      <p className="text-xs text-neutral-500">
        Progres modul{" "}
        <strong className="font-semibold text-neutral-800">{ready}</strong>{" "}
        dari <strong className="font-semibold text-neutral-800">{total}</strong>
      </p>
      <div
        className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={ready}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-cocoa transition-all"
          style={{ width: `${(ready / total) * 100}%` }}
        />
      </div>
      <p className="text-[11px] text-neutral-400">
        Modul “segera” sedang dalam pengerjaan (Tahap 2 — target 30 November
        2026).
      </p>
    </div>
  );
}