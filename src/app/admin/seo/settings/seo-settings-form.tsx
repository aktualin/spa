"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveSeoSettingsAction, type ActionState } from "../../actions/seo";
import { ImageField } from "../../image-field";
import { ErrorMessage, SaveButton } from "../../settings/_components/form-ui";
import { GscSection } from "./seo-gsc-section";
import { SeoDefaultsFields, type SeoDefaultsValues } from "./seo-defaults-fields";

const initialState: ActionState = { error: null };

export function SeoSettingsForm({
  settings,
  siteUrl,
}: {
  settings: { gscVerification: string; faviconUrl: string; defaultOgImageUrl: string } & SeoDefaultsValues;
  siteUrl: string;
}) {
  const [state, formAction] = useActionState(saveSeoSettingsAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/seo" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke SEO
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        Pengaturan SEO global
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Favicon, gambar OG, teks SEO bawaan, dan verifikasi Search Console —
        berlaku untuk seluruh situs. Perubahan tampil tanpa redeploy (browser
        kadang menyimpan favicon lama — muat ulang dengan Ctrl/Cmd + Shift + R).
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

        <SeoDefaultsFields values={settings} />

        <GscSection gscVerification={settings.gscVerification} siteUrl={siteUrl} />

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
