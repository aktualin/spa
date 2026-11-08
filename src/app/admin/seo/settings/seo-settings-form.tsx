"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveSeoSettingsAction, type ActionState } from "../../actions/seo";
import { ImageField } from "../../image-field";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../../settings/_components/form-ui";

const initialState: ActionState = { error: null };

export function SeoSettingsForm({
  settings,
  siteUrl,
}: {
  settings: { gscVerification: string; faviconUrl: string; defaultOgImageUrl: string };
  siteUrl: string;
}) {
  const [state, formAction] = useActionState(saveSeoSettingsAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/seo" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke SEO
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        Favicon, OG &amp; Search Console
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Pengaturan SEO yang berlaku untuk seluruh situs. Perubahan tampil
        tanpa redeploy (browser kadang menyimpan favicon lama — muat ulang
        dengan Ctrl/Cmd + Shift + R).
      </p>

      <form action={formAction} className="mt-6 space-y-6">
        <section className="space-y-2">
          <ImageField
            name="faviconUrl"
            label="Favicon"
            folder="seo"
            defaultValue={settings.faviconUrl}
          />
          <p className="text-xs text-neutral-500">
            Gunakan gambar <strong>PNG persegi</strong>, disarankan{" "}
            <strong>512×512 piksel</strong> dengan latar polos/transparan
            (dipakai juga sebagai ikon saat situs disimpan di layar utama
            ponsel). Format .ico tidak bisa diunggah. Kosongkan untuk memakai
            favicon bawaan.
          </p>
        </section>

        <section className="space-y-2">
          <ImageField
            name="defaultOgImageUrl"
            label="Gambar OG bawaan"
            folder="seo"
            defaultValue={settings.defaultOgImageUrl}
          />
          <p className="text-xs text-neutral-500">
            Tampil saat tautan dibagikan (WhatsApp, Facebook, X, LinkedIn) bila
            halaman tidak punya gambar sendiri. Ukuran ideal{" "}
            <strong>1200×630 piksel</strong> (rasio 1,91:1), JPG/PNG, di bawah
            1 MB agar cepat dimuat.
          </p>
        </section>

        <section className="space-y-3 border-t border-neutral-200 pt-5">
          <Field
            label="Verifikasi Google Search Console"
            htmlFor="gscVerification"
            hint='Tempel tag lengkap <meta name="google-site-verification" content="…" /> atau kodenya saja. Kosongkan untuk menghapus.'
          >
            <input
              id="gscVerification"
              name="gscVerification"
              defaultValue={settings.gscVerification}
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

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/seo" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
