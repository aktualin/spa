"use client";

import Link from "next/link";
import { useActionState } from "react";

import { RETAIL_LIMITS } from "@/lib/domain/retail";

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
import { RichTextField } from "../rich-text-field";

export type RetailFormData = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  priceIdr: string;
  whatsappMessage: string;
  /** String kosong = produk baru diletakkan di akhir daftar. */
  sortOrder: string;
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
          <input
            id="name"
            name="name"
            defaultValue={product.name}
            required
            maxLength={RETAIL_LIMITS.name}
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Penanda unik produk. Huruf kecil, angka, dan tanda hubung, contoh: minyak-sukma-laya."
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

        <RichTextField
          name="description"
          label="Deskripsi"
          defaultValue={product.description}
          folder="retail"
          compact
        />

        <ImageField name="imageUrl" label="Foto produk" folder="retail" defaultValue={product.imageUrl} />

        <Field
          label="Harga (opsional)"
          htmlFor="priceIdr"
          hint="Rupiah penuh, contoh: 250000 atau 250.000. Kosongkan bila harga ditanyakan via WhatsApp — website menampilkan “Hubungi kami”."
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
          hint={
            <>
              Kosongkan untuk memakai template “retail” di Kontak &amp; Umum →
              WhatsApp (bawaan: “Halo kak, saya mau pesan produk [nama]” plus
              harga bila ada). Boleh memakai {"{{product}}"} dan {"{{harga}}"}.
            </>
          }
        >
          <textarea
            id="whatsappMessage"
            name="whatsappMessage"
            defaultValue={product.whatsappMessage}
            rows={2}
            maxLength={RETAIL_LIMITS.whatsappMessage}
            className={inputClass}
          />
        </Field>

        <Field
          label="Urutan tampil"
          htmlFor="sortOrder"
          hint="Makin kecil makin atas. Kosongkan untuk meletakkan produk baru di akhir; urutan juga bisa diatur dengan tombol ↑/↓ di daftar."
        >
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            defaultValue={product.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <div className="space-y-2">
          <Checkbox name="isHighlight" defaultChecked={product.isHighlight}>
            Tandai sebagai <strong>Highlight / Kolaborasi</strong> — tampil
            paling atas dengan label “Highlight”
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
