"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createHomepageSectionAction,
  saveHomepageSectionAction,
  toggleHomepageSectionAction,
  moveHomepageSectionAction,
  type ActionState,
} from "../actions/homepage";
import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import {
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";
import {
  BANNER_FIELDS,
  BANNER_LIMITS,
  displayTitle,
  isBannerKey,
  type BannerDefaults,
  type BannerKey,
} from "@/lib/domain/homepage-banner";
import {
  isDefaultVisibleSection,
  isFixedPositionSection,
} from "@/lib/domain/homepage";
import { SECTION_SOURCE, sectionKeyLabel } from "./homepage-sections";

export type HomepageSectionRow = {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  imageUrl: string;
  mobileImageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  isEnabled: boolean;
  sortOrder: number;
};

const initialState: ActionState = { error: null };

export function HomepageSectionList({
  sections,
  missing,
  bannerDefaults,
}: {
  sections: HomepageSectionRow[];
  missing: string[];
  bannerDefaults: Record<BannerKey, BannerDefaults>;
}) {
  // Footer tidak ikut diurutkan — selalu ditampilkan paling bawah.
  const ordered = sections.filter((section) => !isFixedPositionSection(section.key));
  const fixed = sections.filter((section) => isFixedPositionSection(section.key));

  return (
    <div className="space-y-6">
      {ordered.map((section, index) => (
        <HomepageSectionCard
          key={section.id}
          section={section}
          bannerDefaults={bannerDefaults}
          isFirst={index === 0}
          isLast={index === ordered.length - 1}
        />
      ))}

      {fixed.map((section) => (
        <HomepageSectionCard
          key={section.id}
          section={section}
          bannerDefaults={bannerDefaults}
          isFirst
          isLast
          fixedPosition
        />
      ))}

      {missing.length > 0 ? (
        <section className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <h2 className="text-sm font-semibold text-neutral-800">
            Tambahkan section
          </h2>
          <p className="mt-1 text-xs text-neutral-600">
            Status awal mengikuti homepage sekarang: section bawaan yang sudah
            tampil (mis. Footer) dibuat <strong>aktif</strong>, section baru
            dibuat <strong>mati</strong> sampai admin menyalakannya. Jadi
            homepage tidak berubah saat tombol ini ditekan.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {missing.map((key) => (
              <li key={key}>
                <form action={createHomepageSectionAction}>
                  <input type="hidden" name="key" value={key} />
                  <button
                    type="submit"
                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
                  >
                    Tambahkan {sectionKeyLabel(key)}
                    {isDefaultVisibleSection(key) ? " (aktif)" : " (mati)"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function HomepageSectionCard({
  section,
  bannerDefaults,
  isFirst,
  isLast,
  fixedPosition = false,
}: {
  section: HomepageSectionRow;
  bannerDefaults: Record<BannerKey, BannerDefaults>;
  isFirst: boolean;
  isLast: boolean;
  /** Section berposisi tetap (footer): tanpa tombol urutan. */
  fixedPosition?: boolean;
}) {
  const [state, formAction] = useActionState(
    saveHomepageSectionAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            {sectionKeyLabel(section.key)}
          </h2>
          <p className="text-xs text-neutral-500">
            key: {section.key} ·{" "}
            {fixedPosition ? "selalu paling bawah" : `urutan ${section.sortOrder}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={toggleHomepageSectionAction}>
            <input type="hidden" name="id" value={section.id} />
            {/* Nilai yang dikirim adalah status yang DIINGINKAN setelah
                tombol ditekan, yaitu kebalikan status sekarang. Mengirim
                status saat ini membuat tombolnya tidak pernah mengubah apa
                pun. */}
            <input
              type="hidden"
              name="isEnabled"
              value={section.isEnabled ? "0" : "1"}
            />
            <button
              type="submit"
              title={
                section.isEnabled
                  ? "Klik untuk mematikan section ini"
                  : "Klik untuk menyalakan section ini"
              }
              className={
                section.isEnabled
                  ? "rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  : "rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
              }
            >
              {section.isEnabled ? "Aktif" : "Mati"}
            </button>
          </form>

          {fixedPosition ? null : (
            <>
              <form action={moveHomepageSectionAction}>
                <input type="hidden" name="id" value={section.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  disabled={isFirst}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  ↑
                </button>
              </form>

              <form action={moveHomepageSectionAction}>
                <input type="hidden" name="id" value={section.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  disabled={isLast}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  ↓
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {isBannerKey(section.key) ? (
        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={section.id} />

          <BannerFields
            section={section}
            bannerKey={section.key}
            defaults={bannerDefaults[section.key]}
          />

          <ErrorMessage error={state.error} />

          <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
            <SaveButton label="Simpan section" />
          </div>
        </form>
      ) : SECTION_SOURCE[section.key] ? (
        <SectionSourceNote source={SECTION_SOURCE[section.key]} />
      ) : (
        <GenericSectionForm section={section} />
      )}
    </section>
  );
}

/** Keterangan asal konten section non-banner (tanpa form isian). */
function SectionSourceNote({
  source,
}: {
  source: { text: string; link?: { href: string; label: string } };
}) {
  return (
    <div className="mt-4 rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
      <p>{source.text}</p>
      {source.link ? (
        <Link
          href={source.link.href}
          className="mt-1 inline-block font-medium text-neutral-900 underline underline-offset-2"
        >
          {source.link.label} →
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Form umum (judul, subjudul, isi, gambar) untuk section yang dibuat di luar
 * daftar key bawaan. Section bawaan non-banner memakai `SectionSourceNote`
 * karena isian ini tidak ditampilkan di homepage.
 */
function GenericSectionForm({ section }: { section: HomepageSectionRow }) {
  const [state, formAction] = useActionState(
    saveHomepageSectionAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={section.id} />

      <Field label="Judul" htmlFor={`title-${section.id}`}>
        <input
          id={`title-${section.id}`}
          name="title"
          defaultValue={section.title}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Subjudul" htmlFor={`subtitle-${section.id}`}>
        <input
          id={`subtitle-${section.id}`}
          name="subtitle"
          defaultValue={section.subtitle}
          className={inputClass}
        />
      </Field>

      <RichTextField
        name="bodyHtml"
        label="Isi"
        defaultValue={section.bodyHtml}
        folder="homepage"
      />

      <ImageField
        name="imageUrl"
        label="Gambar"
        folder="homepage"
        defaultValue={section.imageUrl}
      />

      <ErrorMessage error={state.error} />

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
        <SaveButton label="Simpan section" />
      </div>
    </form>
  );
}

/**
 * Field khusus banner (hero, membership-banner, booking-banner). Hanya field
 * yang relevan per section yang ditampilkan; isian kosong = teks/gambar
 * bawaan (ditampilkan sebagai placeholder).
 */
function BannerFields({
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
        <fieldset className="space-y-4 rounded-md border border-neutral-200 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Gambar
          </legend>

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
            label={config.decorativeImage ? "Teks alt (opsional)" : "Teks alt"}
            htmlFor={`imageAlt-${id}`}
            hint={
              config.decorativeImage
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

      <fieldset className="space-y-4 rounded-md border border-neutral-200 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Tombol (CTA)
        </legend>
        <p className="text-xs text-neutral-500">
          {config.ctaHint} Isi keduanya atau kosongkan keduanya.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label tombol" htmlFor={`ctaLabel-${id}`}>
            <input
              id={`ctaLabel-${id}`}
              name="ctaLabel"
              defaultValue={section.ctaLabel}
              maxLength={BANNER_LIMITS.ctaLabel}
              placeholder={defaults.ctaLabel}
              className={inputClass}
            />
          </Field>
          <Field
            label="Tujuan tombol"
            htmlFor={`ctaHref-${id}`}
            hint="Path internal (/menu), anchor (#home_whats_new), atau https://…"
          >
            <input
              id={`ctaHref-${id}`}
              name="ctaHref"
              defaultValue={section.ctaHref}
              maxLength={BANNER_LIMITS.ctaHref}
              placeholder={defaults.ctaHref}
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>
    </>
  );
}
