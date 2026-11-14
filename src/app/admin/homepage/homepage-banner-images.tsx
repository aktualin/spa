"use client";

import Link from "next/link";

import { ImageField } from "../image-field";
import { Field, inputClass } from "../settings/_components/form-ui";
import {
  BANNER_LIMITS,
  type BannerDefaults,
  type BannerKey,
} from "@/lib/domain/homepage-banner";
import type { HomepageSectionRow } from "./homepage-section-shared";

/** Fieldset gambar banner: gambar utama, mobile, dan alt text. */
export function BannerImageFields({
  section,
  bannerKey,
  defaults,
  decorativeImage,
}: {
  section: HomepageSectionRow;
  bannerKey: BannerKey;
  defaults: BannerDefaults;
  decorativeImage: boolean;
}) {
  const id = section.id;
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Gambar
      </legend>

      {bannerKey === "hero" ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          Slider (foto/video) diatur di{" "}
          <Link
            href="/admin/homepage/hero"
            className="font-medium underline underline-offset-2"
          >
            Kelola slide Hero
          </Link>
          . Gambar utama di bawah hanya dipakai sebagai fallback bila tabel
          slide masih kosong.
        </p>
      ) : null}

      <ImageField
        name="imageUrl"
        label="Gambar utama"
        folder="homepage"
        defaultValue={section.imageUrl}
      />
      <p className="text-xs text-neutral-500">
        Kosong = gambar bawaan ({defaults.imageUrl}).{" "}
        {bannerKey === "hero"
          ? "Disarankan lanskap minimal 1920×1080 px, JPG/WebP di bawah 1 MB."
          : "Disarankan rasio 4:3, minimal 1200×900 px, JPG/WebP di bawah 1 MB."}
      </p>

      <ImageField
        name="mobileImageUrl"
        label="Gambar khusus mobile (opsional)"
        folder="homepage"
        defaultValue={section.mobileImageUrl}
      />
      <p className="text-xs text-neutral-500">
        Dipakai pada layar di bawah 768 px. Kosong = gambar utama juga
        dipakai di mobile. Disarankan potret, mis. 1080×1350 px.
      </p>

      <Field
        label={decorativeImage ? "Teks alt (opsional)" : "Teks alt"}
        htmlFor={`imageAlt-${id}`}
        hint={
          decorativeImage
            ? "Gambar hero adalah latar dekoratif di balik judul, jadi boleh dikosongkan (pembaca layar melewatinya). Isi hanya bila gambarnya membawa informasi penting."
            : "Wajib bila gambar diganti: jelaskan isi gambar secara singkat untuk pembaca layar dan mesin pencari."
        }
      >
        <input
          id={`imageAlt-${id}`}
          name="imageAlt"
          defaultValue={section.imageAlt}
          maxLength={BANNER_LIMITS.imageAlt}
          placeholder={defaults.imageAlt || undefined}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}