"use client";

import { useActionState } from "react";

import { saveGiftCardAction, type ActionState } from "../actions/gift-card";
import { ErrorAlert, SaveButton } from "../promos/_kit/form-ui";
import { GiftCardFields } from "./gift-card-form-fields";

export type GiftCardFormData = {
  title: string;
  subtitle: string;
  bodyHtml: string;
  imageUrl: string;
  termsHtml: string;
  whatsappMessage: string;
};

const initialState: ActionState = { error: null };

export function GiftCardForm({
  giftCard,
  isNew,
}: {
  giftCard: GiftCardFormData;
  /** true bila belum pernah disimpan — isi form = teks bawaan situs. */
  isNew: boolean;
}) {
  const [state, formAction] = useActionState(saveGiftCardAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">Gift Card</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Satu-satunya informasi gift card yang tampil di halaman publik
        <span className="font-medium"> /gift-card</span>.
      </p>
      {isNew ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Informasi gift card belum pernah disimpan. Form ini berisi teks bawaan
          yang sekarang tampil di situs — ubah lalu tekan Simpan.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        <GiftCardFields giftCard={giftCard} />

        <ErrorAlert message={state.error} />

        <div className="border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}