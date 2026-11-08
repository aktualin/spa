"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteTreatmentAction,
  saveTreatmentAction,
  type ActionState,
} from "../actions/treatments";
import { ImageField } from "../image-field";

type OptionRow = { label: string; durationMin: string; priceIdr: string };

export type TreatmentFormData = {
  id: string | null;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  whatsappMessage: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  isNew: boolean;
  isBestSeller: boolean;
  isPublished: boolean;
  options: OptionRow[];
};

const initialState: ActionState = { error: null };

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan…" : "Simpan"}
    </button>
  );
}

export function TreatmentForm({
  treatment,
  categories,
}: {
  treatment: TreatmentFormData;
  categories: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(saveTreatmentAction, initialState);
  const [options, setOptions] = useState<OptionRow[]>(
    treatment.options.length > 0
      ? treatment.options
      : [{ label: "", durationMin: "", priceIdr: "" }],
  );

  function updateOption(index: number, patch: Partial<OptionRow>) {
    setOptions((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/treatments"
        className="text-sm text-neutral-600 hover:underline"
      >
        ← Kembali ke daftar
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {treatment.id ? `Ubah ${treatment.name}` : "Tambah treatment"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {treatment.id ? (
          <input type="hidden" name="id" value={treatment.id} />
        ) : null}

        <Field label="Nama" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={treatment.name}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Dipakai di URL. Huruf kecil, angka, dan tanda hubung."
        >
          <input
            id="slug"
            name="slug"
            defaultValue={treatment.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field label="Kategori" htmlFor="categoryId">
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={treatment.categoryId}
            required
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Deskripsi" htmlFor="description">
          <textarea
            id="description"
            name="description"
            defaultValue={treatment.description}
            rows={5}
            className={inputClass}
          />
        </Field>

        <ImageField
          name="imageUrl"
          label="Gambar"
          folder="treatments"
          defaultValue={treatment.imageUrl}
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-neutral-700">
            Durasi &amp; Harga
          </legend>
          <p className="text-xs text-neutral-500">
            Harga dalam rupiah penuh tanpa titik, contoh: 145000. Kosongkan
            seluruh baris untuk menghapusnya.
          </p>

          {options.map((option, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <input
                aria-label={`Label durasi baris ${index + 1}`}
                name={`options[${index}][label]`}
                value={option.label}
                onChange={(e) => updateOption(index, { label: e.target.value })}
                placeholder="60 min"
                className={`${inputClass} min-w-28 flex-1`}
              />
              <input
                aria-label={`Menit baris ${index + 1}`}
                name={`options[${index}][durationMin]`}
                value={option.durationMin}
                onChange={(e) =>
                  updateOption(index, { durationMin: e.target.value })
                }
                inputMode="numeric"
                placeholder="60"
                className={`${inputClass} w-24`}
              />
              <input
                aria-label={`Harga baris ${index + 1}`}
                name={`options[${index}][priceIdr]`}
                value={option.priceIdr}
                onChange={(e) =>
                  updateOption(index, { priceIdr: e.target.value })
                }
                inputMode="numeric"
                placeholder="145000"
                className={`${inputClass} w-32`}
              />
              <button
                type="button"
                onClick={() =>
                  setOptions((rows) => rows.filter((_, i) => i !== index))
                }
                className="rounded-md border border-neutral-300 px-3 text-sm text-neutral-600 hover:bg-neutral-50"
              >
                Hapus
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setOptions((rows) => [
                ...rows,
                { label: "", durationMin: "", priceIdr: "" },
              ])
            }
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            + Tambah durasi
          </button>
        </fieldset>

        <Field
          label="Pesan WhatsApp khusus"
          htmlFor="whatsappMessage"
          hint="Kosongkan untuk memakai template default."
        >
          <input
            id="whatsappMessage"
            name="whatsappMessage"
            defaultValue={treatment.whatsappMessage}
            className={inputClass}
          />
        </Field>

        <Field
          label="Judul SEO"
          htmlFor="seoTitle"
          hint="Judul di hasil pencarian Google. Kosongkan untuk memakai nama treatment."
        >
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={treatment.seoTitle}
            className={inputClass}
          />
        </Field>

        <Field
          label="Deskripsi SEO"
          htmlFor="seoDescription"
          hint="Ringkasan di hasil pencarian Google, idealnya 120–160 karakter. Kosongkan untuk memakai deskripsi treatment."
        >
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={2}
            defaultValue={treatment.seoDescription}
            className={inputClass}
          />
        </Field>

        <Field label="Urutan tampil" htmlFor="sortOrder">
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={treatment.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <div className="space-y-2">
          <Checkbox name="isNew" defaultChecked={treatment.isNew}>
            Tandai sebagai <strong>New</strong>
          </Checkbox>
          <Checkbox name="isBestSeller" defaultChecked={treatment.isBestSeller}>
            Tandai sebagai <strong>Best Seller</strong>
          </Checkbox>
          <Checkbox name="isPublished" defaultChecked={treatment.isPublished}>
            Tampilkan di website
          </Checkbox>
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </p>
        ) : null}

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link
            href="/admin/treatments"
            className="text-sm text-neutral-600 hover:underline"
          >
            Batal
          </Link>
        </div>
      </form>

      {treatment.id ? (
        <form
          action={deleteTreatmentAction}
          className="mt-8 border-t border-neutral-200 pt-4"
        >
          <input type="hidden" name="id" value={treatment.id} />
          <button
            type="submit"
            className="text-sm text-red-700 hover:underline"
          >
            Hapus treatment ini
          </button>
        </form>
      ) : null}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-neutral-700"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function Checkbox({
  name,
  defaultChecked,
  children,
}: {
  name: string;
  defaultChecked: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-neutral-300"
      />
      <span>{children}</span>
    </label>
  );
}
