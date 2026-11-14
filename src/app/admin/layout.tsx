import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EXPIRED_LOGIN_PATH, getSession, hasSessionCookie } from "@/lib/auth";

import { AdminMobileHeader } from "./admin-mobile-header";
import { AdminModuleHint } from "./admin-nav";
import { AdminSidebar } from "./admin-sidebar";
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
      <AdminSidebar groups={groups} email={session.email} role={session.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileHeader groups={groups} />

        <main className="flex-1 px-4 py-6 sm:px-5 lg:px-10 lg:py-10">
          <AdminModuleHint />
          {children}
        </main>
      </div>
    </div>
  );
}