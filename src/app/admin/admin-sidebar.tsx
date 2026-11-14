import Link from "next/link";

import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";

import { AdminNav } from "./admin-nav";
import type { GroupedModules } from "@/lib/domain/admin-access";
import type { AdminModule } from "./modules";

/** Sidebar dashboard (layar besar): logo, navigasi modul, dan akun. */
export function AdminSidebar({
  groups,
  email,
  role,
}: {
  groups: GroupedModules<AdminModule>[];
  email: string;
  role: string;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200/70 bg-white lg:flex">
      <div className="px-4 py-5">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cocoa"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cocoa text-xs font-semibold text-white">
            K
          </span>
          <span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-neutral-400">
              KAMA Spa
            </span>
            <span className="block text-sm font-semibold leading-tight text-neutral-900">
              Dashboard
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <AdminNav groups={groups} />
      </nav>

      <div className="border-t border-neutral-200/70 px-4 py-4">
        <p className="truncate text-sm font-medium text-neutral-900">
          {email}
        </p>
        <span className="mt-1 inline-block rounded bg-cream-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-caramel">
          {role}
        </span>
        <div className="mt-3 flex items-center gap-4">
          <Link
            href={CHANGE_PASSWORD_PATH}
            className="text-xs text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
          >
            Kata sandi
          </Link>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

/** Form POST biasa ke route /admin/logout (lihat logout/route.ts). */
export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/admin/logout" method="post" className={className}>
      <button
        type="submit"
        className="text-xs text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
      >
        Keluar
      </button>
    </form>
  );
}