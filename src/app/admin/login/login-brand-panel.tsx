/** Panel brand kolom kanan halaman login (disembunyikan di layar kecil). */
export function LoginBrandPanel({ markUrl }: { markUrl: string }) {
  return (
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

      {/* Mark besar sebagai latar. */}
      <img
        src={markUrl}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-16 h-56 w-56 -translate-x-1/2 object-contain opacity-[0.08] xl:h-64 xl:w-64"
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
  );
}