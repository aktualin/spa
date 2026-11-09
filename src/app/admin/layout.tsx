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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
        <div className="border-b border-neutral-200 px-5 py-4">
          <Link href="/admin" className="block">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              KAMA Spa
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              Dashboard
            </p>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav groups={groups} />
        </nav>

        <div className="border-t border-neutral-200 px-5 py-4">
          <p className="truncate text-sm font-medium text-neutral-900">
            {session.email}
          </p>
          <p className="text-xs text-neutral-500">{session.role}</p>
          <Link
            href={CHANGE_PASSWORD_PATH}
            className="mt-3 block text-xs text-neutral-600 underline-offset-2 hover:underline"
          >
            Ganti kata sandi
          </Link>
          <LogoutButton className="mt-3" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-neutral-200 bg-white px-5 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="text-sm font-semibold text-neutral-900"
            >
              KAMA Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href={CHANGE_PASSWORD_PATH}
                className="text-xs text-neutral-600 hover:underline"
              >
                Kata sandi
              </Link>
              <LogoutButton />
            </div>
          </div>
          {/* Menu modul di layar kecil — tanpa JS, memakai <details>. */}
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-neutral-600">
              Menu modul
            </summary>
            <div className="mt-2">
              <AdminNav groups={groups} />
            </div>
          </details>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
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
        className="text-sm text-neutral-600 underline-offset-2 hover:underline"
      >
        Keluar
      </button>
    </form>
  );
}
