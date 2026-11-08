"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteRetailAction,
  saveRetailAction,
  type ActionState,
} from "../actions/retail";
import { ImageField } from "../image-field";
import {
  Checkbox,
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";

export type RetailFormData = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  priceIdr: string;
  whatsappMessage: string;
  sortOrder: number;
  isHighlight: boolean;
  isPublished: boolean;
};

const initialState: ActionState = { error: null };

export function RetailForm({ product }: { product: RetailFormData }) {
  const [state, formAction] = useActionState(saveRetailAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/retail" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {product.id ? `Ubah ${product.name}` : "Tambah produk retail"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {product.id ? <input type="hidden" name="id" value={product.id} /> : null}

        <Field label="Nama" htmlFor="name">
          <input id="name" name="name" defaultValue={product.name} required className={inputClass} />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Dipakai di URL. Huruf kecil, angka, dan tanda hubung."
        >
          <input
            id="slug"
            name="slug"
            defaultValue={product.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field label="Deskripsi" htmlFor="description">
          <textarea
            id="description"
            name="description"
            defaultValue={product.description}
            rows={5}
            className={inputClass}
          />
        </Field>

        <ImageField name="imageUrl" label="Gambar" folder="retail" defaultValue={product.imageUrl} />

        <Field
          label="Harga (opsional)"
          htmlFor="priceIdr"
          hint="Rupiah penuh tanpa titik, contoh: 250000. Kosongkan bila harga ditanyakan via WhatsApp."
        >
          <input
            id="priceIdr"
            name="priceIdr"
            defaultValue={product.priceIdr}
            inputMode="numeric"
            placeholder="250000"
            className={`${inputClass} w-40`}
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
            defaultValue={product.whatsappMessage}
            className={inputClass}
          />
        </Field>

        <Field label="Urutan tampil" htmlFor="sortOrder">
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={product.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <div className="space-y-2">
          <Checkbox name="isHighlight" defaultChecked={product.isHighlight}>
            Tandai sebagai <strong>Highlight / Kolaborasi</strong>
          </Checkbox>
          <Checkbox name="isPublished" defaultChecked={product.isPublished}>
            Tampilkan di website
          </Checkbox>
        </div>

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/retail" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {product.id ? (
        <form action={deleteRetailAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmit message={`Hapus produk "${product.name}"?`}>
            Hapus produk ini
          </ConfirmSubmit>
        </form>
      ) : null}
    </div>
  );
}
