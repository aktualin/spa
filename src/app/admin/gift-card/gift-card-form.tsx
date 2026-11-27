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
        The only gift card information shown on the public page
        <span className="font-medium"> /gift-card</span>.
      </p>
      {isNew ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Gift card information has never been saved. This form contains the default
          text currently shown on the site — edit it and press Save.
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