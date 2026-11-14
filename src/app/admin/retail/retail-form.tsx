"use client";

import Link from "next/link";
import { useActionState } from "react";

import { deleteRetailAction, saveRetailAction } from "../actions/retail";
import { ImageField } from "../image-field";
import {
  ConfirmSubmit,
  ErrorMessage,
  SaveButton,
} from "../settings/_components/form-ui";
import { RichTextField } from "../rich-text-field";
import { RetailMetaFields } from "./retail-form-fields";
import { RetailIdentityFields } from "./retail-form-identity";
import { initialState, type RetailFormData } from "./retail-form.types";

export type { RetailFormData } from "./retail-form.types";

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

        <RetailIdentityFields product={product} />

        <RichTextField
          name="description"
          label="Deskripsi"
          defaultValue={product.description}
          folder="retail"
          compact
        />

        <ImageField name="imageUrl" label="Foto produk" folder="retail" defaultValue={product.imageUrl} />

        <RetailMetaFields product={product} />

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