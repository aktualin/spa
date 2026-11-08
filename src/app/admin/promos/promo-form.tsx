"use client";

import Link from "next/link";
import { useActionState } from "react";

import { savePromoAction, deletePromoAction, type ActionState } from "../actions/promos";
import { ImageField } from "../image-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  SeoFields,
  inputClass,
} from "./_kit/form-ui";

export type PromoFormData = {
  id: string | null;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  terms: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  whatsappMessage: string;
};

const initialState: ActionState = { error: null };

export function PromoForm({ promo }: { promo: PromoFormData }) {
  const [state, formAction] = useActionState(savePromoAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/promos" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar promo
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {promo.id ? `Ubah promo ${promo.title}` : "Tambah promo"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {promo.id ? <input type="hidden" name="id" value={promo.id} /> : null}

        <Field label="Judul promo" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={promo.title}
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
            defaultValue={promo.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field label="Deskripsi" htmlFor="description">
          <textarea
            id="description"
            name="description"
            defaultValue={promo.description}
            rows={4}
            className={inputClass}
          />
        </Field>

        <ImageField
          name="bannerUrl"
          label="Banner promo"
          folder="promos"
          defaultValue={promo.bannerUrl}
        />

        <Field
          label="Syarat & ketentuan"
          htmlFor="terms"
          hint="Ditampilkan di halaman detail promo."
        >
          <textarea
            id="terms"
            name="terms"
            defaultValue={promo.terms}
            rows={5}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Mulai berlaku"
            htmlFor="startDate"
            hint="Kosongkan bila langsung aktif."
          >
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={promo.startDate}
              className={inputClass}
            />
          </Field>

          <Field
            label="Berakhir"
            htmlFor="endDate"
            hint="Harus lebih besar dari tanggal mulai."
          >
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={promo.endDate}
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
            defaultValue={promo.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <Field
          label="Pesan WhatsApp khusus"
          htmlFor="whatsappMessage"
          hint="Kosongkan untuk memakai template default."
        >
          <input
            id="whatsappMessage"
            name="whatsappMessage"
            defaultValue={promo.whatsappMessage}
            className={inputClass}
          />
        </Field>

        <Checkbox name="isPublished" defaultChecked={promo.isPublished}>
          Tampilkan di website
        </Checkbox>

        <SeoFields
          title={promo.seoTitle}
          description={promo.seoDescription}
        />

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/promos" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {promo.id ? (
        <form action={deletePromoAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={promo.id} />
          <ConfirmDeleteButton message="Hapus promo ini? Banner di storage juga dihapus.">
            Hapus promo ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
