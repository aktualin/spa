"use client";

import { Field, inputClass } from "../settings/_components/form-ui";
import {
  BANNER_FIELDS,
  BANNER_LIMITS,
  displayTitle,
  type BannerDefaults,
  type BannerKey,
} from "@/lib/domain/homepage-banner";
import { BannerCtaFields } from "./homepage-banner-cta";
import { BannerImageFields } from "./homepage-banner-images";
import type { HomepageSectionRow } from "./homepage-section-shared";

/**
 * Field khusus banner (hero, membership-banner, booking-banner). Hanya field
 * yang relevan per section yang ditampilkan; isian kosong = teks/gambar
 * bawaan (ditampilkan sebagai placeholder).
 */
export function BannerFields({
  section,
  bannerKey,
  defaults,
}: {
  section: HomepageSectionRow;
  bannerKey: BannerKey;
  defaults: BannerDefaults;
}) {
  const config = BANNER_FIELDS[bannerKey];
  const id = section.id;
  // Kolom `title` lama berisi label admin ("Hero", dst.) — jangan tampilkan
  // sebagai isian; kosong berarti memakai judul bawaan.
  const title = displayTitle(section.key, section.title) ?? "";

  return (
    <>
      <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
        Kosongkan field untuk memakai teks/gambar bawaan (ditampilkan samar
        sebagai contoh di dalam kotak isian).
      </p>

      {config.image ? (
        <BannerImageFields
          section={section}
          bannerKey={bannerKey}
          defaults={defaults}
          decorativeImage={Boolean(config.decorativeImage)}
        />
      ) : null}

      <Field label={config.titleLabel} htmlFor={`title-${id}`}>
        <input
          id={`title-${id}`}
          name="title"
          defaultValue={title}
          maxLength={BANNER_LIMITS.title}
          placeholder={defaults.title}
          className={inputClass}
        />
      </Field>

      {config.subtitle ? (
        <Field label={config.subtitleLabel} htmlFor={`subtitle-${id}`}>
          {bannerKey === "hero" ? (
            <input
              id={`subtitle-${id}`}
              name="subtitle"
              defaultValue={section.subtitle}
              maxLength={BANNER_LIMITS.subtitle}
              placeholder={defaults.subtitle}
              className={inputClass}
            />
          ) : (
            <textarea
              id={`subtitle-${id}`}
              name="subtitle"
              rows={3}
              defaultValue={section.subtitle}
              maxLength={BANNER_LIMITS.subtitle}
              placeholder={defaults.subtitle}
              className={inputClass}
            />
          )}
        </Field>
      ) : null}

      <BannerCtaFields section={section} id={id} defaults={defaults} ctaHint={config.ctaHint} />
    </>
  );
}