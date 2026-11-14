import type { Metadata } from "next";

import { asset } from "@/lib/asset-url";
import { getSiteSettings } from "@/lib/content/site";

import { LoginBrandPanel } from "./login-brand-panel";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk Dashboard — KAMASPA",
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

  // Mark brand mengikuti Kontak & Umum; tanpa logo tersimpan → aset bawaan.
  const settings = await getSiteSettings();
  const markUrl = settings.logoMarkLightUrl || asset("img/kama/mark-kama-light.png");
  const markAlt = settings.brandLogoAlt || "KAMASPA";

  return (
    <main className="min-h-screen bg-cream-soft p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* ── Kolom kiri: form masuk ─────────────────────────────────── */}
        <section className="flex items-center justify-center px-2 py-10 sm:px-6">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2.5">
              {/* URL storage eksternal arbitrer — <img> biasa, bukan next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={markUrl} alt={markAlt} className="h-8 w-8 object-contain" />
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-espresso">
                KAMASPA
              </span>
            </div>

            <h1 className="mt-7 text-3xl font-semibold tracking-tight text-espresso">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              Masuk untuk mengelola konten situs KAMASPA.
            </p>

            {expired ? (
              <p
                role="alert"
                className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
              >
                Sesi Anda berakhir karena kata sandi, peran, atau status akun
                berubah. Silakan masuk kembali.
              </p>
            ) : null}

            <LoginForm next={next} />

            <p className="mt-8 text-xs text-ink/45">
              Halaman ini khusus pengelola KAMASPA. Akun dibuat oleh
              administrator — tidak ada pendaftaran mandiri.
            </p>
          </div>
        </section>

        {/* ── Kolom kanan: panel brand (disembunyikan di layar kecil) ── */}
        <LoginBrandPanel markUrl={markUrl} />
      </div>
    </main>
  );
}
