import type { Metadata } from "next";

import { BrandMark } from "./brand-mark";
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

  return (
    <main className="min-h-screen bg-cream-soft p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* ── Kolom kiri: form masuk ─────────────────────────────────── */}
        <section className="flex items-center justify-center px-2 py-10 sm:px-6">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-8 w-8 text-cocoa" />
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
        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden rounded-[28px] bg-espresso lg:flex lg:flex-col lg:justify-end"
        >
          {/* Sapuan cahaya diagonal — murni dekoratif. */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-32 h-[34rem] w-[34rem] rotate-12 bg-gradient-to-br from-caramel/25 via-transparent to-transparent blur-2xl" />
            <div className="absolute right-[18%] top-[-12%] h-[150%] w-px rotate-[18deg] bg-gradient-to-b from-clay/50 to-transparent" />
            <div className="absolute right-[26%] top-[-12%] h-[150%] w-px rotate-[18deg] bg-gradient-to-b from-clay/25 to-transparent" />
          </div>

          {/* Monogram besar sebagai latar. */}
          <BrandMark
            className="pointer-events-none absolute left-1/2 top-16 h-56 w-56 -translate-x-1/2 text-cream/[0.08] xl:h-64 xl:w-64"
            title=""
          />

          <div className="relative p-10 xl:p-12">
            <p className="text-xs uppercase tracking-[0.3em] text-clay/80">
              KAMASPA
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight text-cream xl:text-4xl">
              Welcome to KAMASPA
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/60">
              Seluruh isi situs — treatment, harga, promo, galeri, hingga teks
              tiap halaman — dikelola dari satu dashboard ini.
            </p>

            <div className="mt-10 rounded-2xl border border-cream/10 bg-cream/[0.04] p-6 backdrop-blur-sm">
              <p className="text-lg font-medium leading-snug text-cream">
                Satu sumber untuk semua konten
              </p>
              <p className="mt-2 text-sm leading-relaxed text-cream/55">
                Perubahan yang Anda simpan di sini langsung tampil di situs —
                tanpa perlu menyentuh kode.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
