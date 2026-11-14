"use client";

import Link from "next/link";
import { useActionState } from "react";

import { savePromoAction, deletePromoAction } from "../actions/promos";
import { plainTextToHtml } from "@/lib/domain/rich-text";

import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  SaveButton,
  SeoFields,
} from "./_kit/form-ui";
import { PromoIdentityFields, PromoPeriodFields } from "./promo-form-fields";
import { initialState, type PromoFormData } from "./promo-form.types";

export type { PromoFormData } from "./promo-form.types";

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

        <PromoIdentityFields promo={promo} />

        <RichTextField
          name="description"
          label="Deskripsi"
          defaultValue={promo.description}
          folder="promos"
          compact
        />

        <ImageField
          name="bannerUrl"
          label="Banner promo"
          folder="promos"
          defaultValue={promo.bannerUrl}
        />

        <RichTextField
          name="terms"
          label="Syarat & ketentuan"
          folder="promos"
          defaultValue={plainTextToHtml(promo.terms)}
        />

        <PromoPeriodFields promo={promo} />

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
          <ConfirmDeleteButton message="Hapus promo ini? Banner tetap tersimpan di Media Library.">
            Hapus promo ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}