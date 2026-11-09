import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { EXPIRED_LOGIN_PATH, getSession, hasSessionCookie } from "@/lib/auth";
import { CHANGE_PASSWORD_PATH } from "@/lib/domain/admin-redirect";

import { AdminModuleHint, AdminNav } from "./admin-nav";
import { groupedModulesForRole } from "./modules";

export const metadata: Metadata = {
  title: "Dashboard — KAMA Spa",
  robots: { index: false, follow: false },
};

// Seluruh area admin membaca cookie sesi — tidak pernah statis.
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Halaman /admin/login memakai layout ini juga, tapi tanpa sesi: tampilkan
  // anak-nya langsung tanpa shell dashboard. Proxy yang menjaga sisanya.
  if (!session) {
    // Token masih sah secara kriptografi tapi sudah dicabut di database
    // (akun nonaktif / password diganti): paksa login ulang.
    if (await hasSessionCookie()) redirect(EXPIRED_LOGIN_PATH);
    return <div data-admin-shell>{children}</div>;
  }

  const groups = groupedModulesForRole(session.role);

  return (
    <div data-admin-shell className="flex min-h-screen bg-neutral-50">
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
            {session.email}
          </p>
          <span className="mt-1 inline-block rounded bg-cream-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-caramel">
            {session.role}
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

      <div className="flex min-w-0 flex-1 flex-col">
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

        <main className="flex-1 px-4 py-6 sm:px-5 lg:px-10 lg:py-10">
          <AdminModuleHint />
          {children}
        </main>
      </div>
    </div>
  );
}

/** Form POST biasa ke route /admin/logout (lihat logout/route.ts). */
function LogoutButton({ className }: { className?: string }) {
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
