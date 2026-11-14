import Link from "next/link";

import type { GroupedModules } from "@/lib/domain/admin-access";
import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";

import { AdminNav } from "./admin-nav";
import { LogoutButton } from "./admin-sidebar";
import type { AdminModule } from "./modules";

/** Header layar kecil: logo, akun, dan menu modul via <details> (tanpa JS). */
export function AdminMobileHeader({ groups }: { groups: GroupedModules<AdminModule>[] }) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/70 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm font-semibold text-neutral-900"
        >
          <span className="grid size-7 place-items-center rounded-md bg-cocoa text-[10px] font-semibold text-white">
            K
          </span>
          KAMA
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={CHANGE_PASSWORD_PATH}
            className="text-xs text-neutral-500 hover:text-neutral-900"
          >
            Kata sandi
          </Link>
          <LogoutButton />
        </div>
      </div>
      {/* Menu modul di layar kecil — tanpa JS, memakai <details>. */}
      <details className="group mt-2">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
          Menu
          <span
            aria-hidden
            className="text-neutral-400 transition-transform group-open:rotate-180"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </summary>
        <div className="mt-3 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-2">
          <AdminNav groups={groups} />
        </div>
      </details>
    </header>
  );
}