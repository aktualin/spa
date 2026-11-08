"use client";

import { useActionState } from "react";

import { saveGiftCardAction, type ActionState } from "../actions/gift-card";
import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import { ErrorAlert, Field, SaveButton, inputClass } from "../promos/_kit/form-ui";

export type GiftCardFormData = {
  title: string;
  bodyHtml: string;
  imageUrl: string;
};

const initialState: ActionState = { error: null };

export function GiftCardForm({ giftCard }: { giftCard: GiftCardFormData }) {
  const [state, formAction] = useActionState(saveGiftCardAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">Gift Card</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Satu-satunya informasi gift card yang tampil di halaman publik
        <span className="font-medium"> /gift-card</span>.
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        <Field label="Judul" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={giftCard.title}
            required
            className={inputClass}
          />
        </Field>

        <RichTextField
          name="bodyHtml"
          label="Isi gift card"
          folder="gift-card"
          defaultValue={giftCard.bodyHtml}
        />

        <ImageField
          name="imageUrl"
          label="Gambar gift card"
          folder="gift-card"
          defaultValue={giftCard.imageUrl}
        />

        <ErrorAlert message={state.error} />

        <div className="border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}
