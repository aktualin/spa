import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk Dashboard — KAMA Spa",
  robots: { index: false, follow: false },
};

// Halaman admin selalu bergantung pada cookie sesi & searchParams, jadi tidak
// boleh di-prerender sebagai halaman statis (Cache Components, Next.js 16).
export const instant = false;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string }>;
}) {
  const { next, expired } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            KAMA Spa
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
            Dashboard Admin
          </h1>
        </div>
        {expired ? (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Sesi Anda berakhir karena kata sandi, peran, atau status akun
            berubah. Silakan masuk kembali.
          </p>
        ) : null}
        <LoginForm next={next} />
      </div>
    </main>
  );
}
