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

  // App-shell: di layar besar tinggi shell dikunci (lg:h-screen + overflow
  // hidden) sehingga sidebar diam dan HANYA kolom konten yang menggulir
  // (lg:overflow-y-auto). Di layar kecil tetap scroll dokumen normal.
  return (
    <div
      data-admin-shell
      className="flex min-h-screen bg-white lg:h-screen lg:overflow-hidden"
    >
      <AdminSidebar groups={groups} email={session.email} role={session.role} />

      <div className="flex min-w-0 flex-1 flex-col lg:h-full lg:overflow-y-auto">
        <AdminMobileHeader groups={groups} />

        <main className="flex-1 px-4 py-6 sm:px-5 lg:px-10 lg:py-10">
          <AdminModuleHint />
          {children}
        </main>
      </div>
    </div>
  );
}