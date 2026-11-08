"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  deletePackageAction,
  savePackageAction,
  type ActionState,
} from "../../actions/packages";
import { ImageField } from "../../image-field";

export type PackageItemRow = {
  treatmentId: string;
  label: string;
  minutes: string;
};

export type PackageFormData = {
  id: string | null;
  name: string;
  slug: string;
  subtitle: string;
  quote: string;
  description: string;
  imageUrl: string;
  priceIdr: string;
  durationMin: string;
  durationLabel: string;
  sortOrder: number;
  isNew: boolean;
  isBestSeller: boolean;
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
  whatsappMessage: string;
  items: PackageItemRow[];
};

export type TreatmentOption = {
  id: string;
  name: string;
  categoryName: string;
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

export function PackageForm({
  pkg,
  treatments,
}: {
  pkg: PackageFormData;
  treatments: TreatmentOption[];
}) {
  const [state, formAction] = useActionState(savePackageAction, initialState);
  const [items, setItems] = useState<PackageItemRow[]>(
    pkg.items.length > 0
      ? pkg.items
      : [{ treatmentId: "", label: "", minutes: "" }],
  );

  function updateItem(index: number, patch: Partial<PackageItemRow>) {
    setItems((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/treatments/packages"
        className="text-sm text-neutral-600 hover:underline"
      >
        ← Kembali ke daftar package
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {pkg.id ? `Ubah ${pkg.name}` : "Tambah package"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {pkg.id ? <input type="hidden" name="id" value={pkg.id} /> : null}

        <Field label="Nama" htmlFor="name">
          <input
            id="name"
            name="name"
            defaultValue={pkg.name}
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
            defaultValue={pkg.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field
          label="Subjudul"
          htmlFor="subtitle"
          hint='Tampil di atas nama paket, contoh: "A state of balance & inner resolution".'
        >
          <input
            id="subtitle"
            name="subtitle"
            defaultValue={pkg.subtitle}
            maxLength={160}
            className={inputClass}
          />
        </Field>

        <Field label="Deskripsi" htmlFor="description">
          <textarea
            id="description"
            name="description"
            defaultValue={pkg.description}
            rows={5}
            className={inputClass}
          />
        </Field>

        <Field label="Kutipan" htmlFor="quote" hint="Opsional, tampil miring di halaman detail paket.">
          <input
            id="quote"
            name="quote"
            defaultValue={pkg.quote}
            maxLength={200}
            className={inputClass}
          />
        </Field>

        <ImageField
          name="imageUrl"
          label="Gambar"
          folder="packages"
          defaultValue={pkg.imageUrl}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Harga (Rp)"
            htmlFor="priceIdr"
            hint="Rupiah penuh tanpa titik, contoh: 1500000."
          >
            <input
              id="priceIdr"
              name="priceIdr"
              defaultValue={pkg.priceIdr}
              required
              inputMode="numeric"
              className={inputClass}
            />
          </Field>

          <Field
            label="Durasi (menit)"
            htmlFor="durationMin"
            hint="Opsional. Kosongkan bila tidak ada durasi tetap."
          >
            <input
              id="durationMin"
              name="durationMin"
              defaultValue={pkg.durationMin}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Teks durasi"
          htmlFor="durationLabel"
          hint='Teks yang tampil di halaman Menu, contoh: "2 hours 30 minute". Kosong = dari durasi menit.'
        >
          <input
            id="durationLabel"
            name="durationLabel"
            defaultValue={pkg.durationLabel}
            maxLength={40}
            className={inputClass}
          />
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-neutral-700">
            Isi package
          </legend>
          <p className="text-xs text-neutral-500">
            Pilih treatment dari daftar (boleh lintas kategori) atau tulis label
            bebas. Urutan baris mengikuti urutan tampil.
          </p>

          {items.map((item, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <select
                aria-label={`Treatment baris ${index + 1}`}
                name={`items[${index}][treatmentId]`}
                value={item.treatmentId}
                onChange={(e) =>
                  updateItem(index, { treatmentId: e.target.value })
                }
                className={`${inputClass} min-w-48 flex-1`}
              >
                <option value="">— label bebas —</option>
                {treatments.map((treatment) => (
                  <option key={treatment.id} value={treatment.id}>
                    {treatment.categoryName} · {treatment.name}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Label baris ${index + 1}`}
                name={`items[${index}][label]`}
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                placeholder="Contoh: Konsultasi gratis"
                className={`${inputClass} min-w-40 flex-1`}
              />
              <input
                aria-label={`Menit baris ${index + 1}`}
                name={`items[${index}][minutes]`}
                value={item.minutes}
                onChange={(e) => updateItem(index, { minutes: e.target.value })}
                placeholder="Menit"
                inputMode="numeric"
                className={`${inputClass} w-24`}
              />
              <button
                type="button"
                onClick={() =>
                  setItems((rows) => rows.filter((_, i) => i !== index))
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
              setItems((rows) => [...rows, { treatmentId: "", label: "", minutes: "" }])
            }
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            + Tambah isi
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
            defaultValue={pkg.whatsappMessage}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO title" htmlFor="seoTitle">
            <input
              id="seoTitle"
              name="seoTitle"
              defaultValue={pkg.seoTitle}
              className={inputClass}
            />
          </Field>
          <Field label="SEO description" htmlFor="seoDescription">
            <input
              id="seoDescription"
              name="seoDescription"
              defaultValue={pkg.seoDescription}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Urutan tampil" htmlFor="sortOrder">
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={pkg.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="isNew"
              defaultChecked={pkg.isNew}
              className="size-4 rounded border-neutral-300"
            />
            <span>Tandai sebagai New</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="isBestSeller"
              defaultChecked={pkg.isBestSeller}
              className="size-4 rounded border-neutral-300"
            />
            <span>Tandai sebagai Best Seller</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={pkg.isPublished}
              className="size-4 rounded border-neutral-300"
            />
            <span>Tampilkan di website</span>
          </label>
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
            href="/admin/treatments/packages"
            className="text-sm text-neutral-600 hover:underline"
          >
            Batal
          </Link>
        </div>
      </form>

      {pkg.id ? (
        <form
          action={deletePackageAction}
          className="mt-8 border-t border-neutral-200 pt-4"
        >
          <input type="hidden" name="id" value={pkg.id} />
          <button type="submit" className="text-sm text-red-700 hover:underline">
            Hapus package ini
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
