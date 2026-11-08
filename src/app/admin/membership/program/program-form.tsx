"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  PROGRAM_LIMITS,
  type MembershipProgramData,
} from "@/lib/domain/membership";

import { saveProgramAction, type ActionState } from "../../actions/membership";
import { ErrorAlert, Field, SaveButton, inputClass, secondaryButtonClass } from "../../promos/_kit/form-ui";
import { RichTextField } from "../../rich-text-field";

const initialState: ActionState = { error: null };

type Row = { key: number; title: string; body: string };

let nextKey = 0;
const toRows = (items: { title: string; body: string }[]): Row[] =>
  (items.length > 0 ? items : [{ title: "", body: "" }]).map((item) => ({
    key: nextKey++,
    ...item,
  }));

/**
 * Daftar baris dua kolom (judul + keterangan) yang bisa ditambah, dihapus,
 * dan diurutkan. Dikirim sebagai `<prefix>Title` / `<prefix>Body` berulang.
 */
function RowList({
  legend,
  titleName,
  bodyName,
  titleLabel,
  bodyLabel,
  initial,
  max,
}: {
  legend: string;
  titleName: string;
  bodyName: string;
  titleLabel: string;
  bodyLabel: string;
  initial: { title: string; body: string }[];
  max: number;
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(initial));

  function move(index: number, direction: -1 | 1) {
    setRows((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <fieldset className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-medium text-neutral-800">{legend}</legend>
      {rows.map((row, index) => (
        <div key={row.key} className="space-y-2 rounded-md bg-neutral-50 p-3">
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
            <span>Baris {index + 1}</span>
            <span className="flex gap-1.5">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={secondaryButtonClass} aria-label={`Naikkan baris ${index + 1}`}>
                ↑
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className={secondaryButtonClass} aria-label={`Turunkan baris ${index + 1}`}>
                ↓
              </button>
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
                className={secondaryButtonClass}
              >
                Hapus
              </button>
            </span>
          </div>
          <input
            name={titleName}
            defaultValue={row.title}
            aria-label={`${titleLabel} baris ${index + 1}`}
            placeholder={titleLabel}
            maxLength={PROGRAM_LIMITS.itemTitle}
            className={inputClass}
          />
          <textarea
            name={bodyName}
            defaultValue={row.body}
            aria-label={`${bodyLabel} baris ${index + 1}`}
            placeholder={bodyLabel}
            maxLength={PROGRAM_LIMITS.itemBody}
            rows={2}
            className={inputClass}
          />
        </div>
      ))}
      {rows.length < max ? (
        <button
          type="button"
          onClick={() => setRows((current) => [...current, { key: nextKey++, title: "", body: "" }])}
          className={secondaryButtonClass}
        >
          + Tambah baris
        </button>
      ) : null}
    </fieldset>
  );
}

export function MembershipProgramForm({
  program,
  isNew,
}: {
  program: MembershipProgramData;
  isNew: boolean;
}) {
  const [state, formAction] = useActionState(saveProgramAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/membership" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke Membership
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">Program membership</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Isi halaman <span className="font-medium">/membership</span> serta kalimat harga
        dan deskripsi banner membership di homepage. Paket/tier diatur di daftar tier.
      </p>
      {isNew ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Program belum pernah disimpan. Form ini berisi teks bawaan yang sekarang
          tampil di situs — ubah lalu tekan Simpan.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        <Field label="Eyebrow" htmlFor="eyebrow" hint="Label kecil di atas judul.">
          <input id="eyebrow" name="eyebrow" defaultValue={program.eyebrow} required maxLength={PROGRAM_LIMITS.eyebrow} className={inputClass} />
        </Field>
        <Field label="Judul" htmlFor="title">
          <textarea id="title" name="title" defaultValue={program.title} required maxLength={PROGRAM_LIMITS.title} rows={2} className={inputClass} />
        </Field>
        <Field label="Intro" htmlFor="intro">
          <textarea id="intro" name="intro" defaultValue={program.intro} required maxLength={PROGRAM_LIMITS.intro} rows={3} className={inputClass} />
        </Field>
        <Field
          label="Kalimat harga"
          htmlFor="priceHeadline"
          hint='Contoh "Just Rp 1.5jt a month." Tampil di banner membership homepage dan bagian Main Benefits. Harga per tier diatur di tier atau modul Harga.'
        >
          <input id="priceHeadline" name="priceHeadline" defaultValue={program.priceHeadline} required maxLength={PROGRAM_LIMITS.priceHeadline} className={inputClass} />
        </Field>
        <Field
          label="Deskripsi banner homepage"
          htmlFor="bannerBody"
          hint="Teks di banner membership homepage. Bila diisi di modul Homepage (Banner Membership → subjudul), isian di sana yang dipakai."
        >
          <textarea id="bannerBody" name="bannerBody" defaultValue={program.bannerBody} required maxLength={PROGRAM_LIMITS.bannerBody} rows={3} className={inputClass} />
        </Field>

        <RowList
          legend="Main benefits"
          titleName="benefitTitle"
          bodyName="benefitBody"
          titleLabel="Judul benefit"
          bodyLabel="Keterangan benefit"
          initial={program.benefits}
          max={PROGRAM_LIMITS.maxBenefits}
        />

        <Field label="Intro essential services" htmlFor="servicesIntro">
          <textarea id="servicesIntro" name="servicesIntro" defaultValue={program.servicesIntro} required maxLength={PROGRAM_LIMITS.servicesIntro} rows={2} className={inputClass} />
        </Field>

        <RowList
          legend="Essential services"
          titleName="serviceName"
          bodyName="serviceDescription"
          titleLabel="Nama layanan"
          bodyLabel="Deskripsi layanan"
          initial={program.services.map((s) => ({ title: s.name, body: s.description }))}
          max={PROGRAM_LIMITS.maxServices}
        />

        <RichTextField
          name="termsHtml"
          label="Syarat & ketentuan program (opsional)"
          folder="membership"
          defaultValue={program.termsHtml ?? ""}
        />

        <ErrorAlert message={state.error} />

        <div className="border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}
