"use client";

import { Field, inputClass } from "../../settings/_components/form-ui";

/** Verifikasi Google Search Console + panduan langkah demi langkah. */
export function GscSection({
  gscVerification,
  siteUrl,
}: {
  gscVerification: string;
  siteUrl: string;
}) {
  return (
    <section className="space-y-3 border-t border-neutral-200 pt-5">
      <Field
        label="Verifikasi Google Search Console"
        htmlFor="gscVerification"
        hint='Tempel tag lengkap <meta name="google-site-verification" content="…" /> atau kodenya saja. Kosongkan untuk menghapus.'
      >
        <input
          id="gscVerification"
          name="gscVerification"
          defaultValue={gscVerification}
          placeholder='<meta name="google-site-verification" content="…" />'
          className={`${inputClass} font-mono text-xs`}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>

      <details className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        <summary className="cursor-pointer font-medium">
          Langkah verifikasi &amp; kirim sitemap
        </summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          <li>
            Buka{" "}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Google Search Console
            </a>{" "}
            dan masuk dengan akun Google bisnis.
          </li>
          <li>
            Tambah properti → pilih <strong>Awalan URL</strong> → isi{" "}
            <code className="text-xs">{siteUrl}</code>.
          </li>
          <li>
            Pada metode verifikasi, pilih <strong>Tag HTML</strong> lalu
            salin tag <code className="text-xs">&lt;meta …&gt;</code>.
          </li>
          <li>Tempel di kolom di atas, tekan <strong>Simpan</strong>.</li>
          <li>
            Kembali ke Search Console, tekan <strong>Verifikasi</strong>.
            Jangan hapus kode ini setelah berhasil — Google memeriksanya
            berkala.
          </li>
          <li>
            Di menu <strong>Sitemap</strong>, kirim{" "}
            <code className="text-xs">{siteUrl}/sitemap.xml</code>. Sitemap
            diperbarui otomatis setiap konten berubah, jadi cukup dikirim
            sekali.
          </li>
        </ol>
      </details>
    </section>
  );
}