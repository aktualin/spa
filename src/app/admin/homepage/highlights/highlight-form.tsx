"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  HIGHLIGHT_DEFAULT_CTA,
  HIGHLIGHT_LIMITS,
} from "@/lib/domain/homepage";

import {
  deleteHomepageHighlightAction,
  saveHomepageHighlightAction,
  type ActionState,
} from "../../actions/homepage-highlights";
import { ImageField } from "../../image-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";

export type HighlightFormData = {
  id: string | null;
  eyebrow: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
};

const initialState: ActionState = { error: null };

const LIST_PATH = "/admin/homepage/highlights";

export function HighlightForm({ highlight }: { highlight: HighlightFormData }) {
  const [state, formAction] = useActionState(
    saveHomepageHighlightAction,
    initialState,
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar highlight
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {highlight.id ? "Ubah highlight" : "Tambah highlight"}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Tampil sebagai kartu di section “What’s New” homepage: gambar, label
        kategori, judul, dan tautan “{HIGHLIGHT_DEFAULT_CTA}”.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        {highlight.id ? <input type="hidden" name="id" value={highlight.id} /> : null}

        <Field label="Judul" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={highlight.title}
            required
            maxLength={HIGHLIGHT_LIMITS.title}
            className={inputClass}
          />
        </Field>

        <Field
          label="Label kategori (opsional)"
          htmlFor="eyebrow"
          hint="Teks kecil di atas judul, mis. Massage, Promo, Event. Ditampilkan sebelum “KAMA Journal”."
        >
          <input
            id="eyebrow"
            name="eyebrow"
            defaultValue={highlight.eyebrow}
            maxLength={HIGHLIGHT_LIMITS.eyebrow}
            className={inputClass}
          />
        </Field>

        <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-medium text-neutral-700">Gambar</legend>
          <ImageField
            name="imageUrl"
            label="Gambar kartu"
            folder="homepage"
            defaultValue={highlight.imageUrl}
          />
          <p className="text-xs text-neutral-500">
            Dipotong rasio 16:11. Disarankan minimal 1200×825 px, JPG/WebP di
            bawah 1 MB. Kosong = kotak polos berwarna krem.
          </p>
          <Field
            label="Teks alt (opsional)"
            htmlFor="imageAlt"
            hint="Judul kartu sudah dibacakan pembaca layar, jadi alt boleh dikosongkan bila gambar hanya hiasan."
          >
            <input
              id="imageAlt"
              name="imageAlt"
              defaultValue={highlight.imageAlt}
              maxLength={HIGHLIGHT_LIMITS.imageAlt}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-medium text-neutral-700">Tautan</legend>
          <Field
            label="Tujuan tautan (opsional)"
            htmlFor="href"
            hint="Path internal (/menu#massage), anchor (#home_whats_new), atau https://…. Kosong = kartu tidak bisa diklik dan tanpa teks tombol."
          >
            <input
              id="href"
              name="href"
              defaultValue={highlight.href}
              maxLength={HIGHLIGHT_LIMITS.href}
              className={inputClass}
            />
          </Field>
          <Field
            label="Teks tombol (opsional)"
            htmlFor="ctaLabel"
            hint={`Kosong = “${HIGHLIGHT_DEFAULT_CTA}”. Hanya dipakai bila tujuan tautan diisi.`}
          >
            <input
              id="ctaLabel"
              name="ctaLabel"
              defaultValue={highlight.ctaLabel}
              maxLength={HIGHLIGHT_LIMITS.ctaLabel}
              placeholder={HIGHLIGHT_DEFAULT_CTA}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Mulai tampil (opsional)"
            htmlFor="startDate"
            hint="Kosong = langsung tampil. Mulai pukul 00.00 WIB."
          >
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={highlight.startDate}
              className={inputClass}
            />
          </Field>
          <Field
            label="Berhenti tampil (opsional)"
            htmlFor="endDate"
            hint="Kosong = tampil terus. Berakhir pukul 23.59 WIB."
          >
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={highlight.endDate}
              className={inputClass}
            />
          </Field>
        </div>

        <Checkbox name="isPublished" defaultChecked={highlight.isPublished}>
          Terbitkan di homepage
        </Checkbox>

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {highlight.id ? (
        <form
          action={deleteHomepageHighlightAction}
          className="mt-8 border-t border-neutral-200 pt-4"
        >
          <input type="hidden" name="id" value={highlight.id} />
          <ConfirmDeleteButton message="Hapus highlight ini? Gambar yang tercatat di Media Library tetap tersimpan.">
            Hapus highlight ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
