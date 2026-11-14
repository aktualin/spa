"use client";

import { HIGHLIGHT_LIMITS } from "@/lib/domain/homepage";

import { Field, inputClass } from "../../promos/_kit/form-ui";
import type { HighlightFormData } from "./highlight-form.types";

/** Fieldset tautan kartu + teks tombol. */
export function HighlightLinkFields({ highlight }: { highlight: HighlightFormData }) {
  return (
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
        hint="Kosong = memakai teks cadangan dari modul Teks Halaman (home.whats_new.cta_fallback). Hanya dipakai bila tujuan tautan diisi."
      >
        <input
          id="ctaLabel"
          name="ctaLabel"
          defaultValue={highlight.ctaLabel}
          maxLength={HIGHLIGHT_LIMITS.ctaLabel}
          className={inputClass}
        />
      </Field>
    </fieldset>
  );
}

/** Periode tampil highlight (mulai/berhenti, opsional). */
export function HighlightPeriodFields({ highlight }: { highlight: HighlightFormData }) {
  return (
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
  );
}