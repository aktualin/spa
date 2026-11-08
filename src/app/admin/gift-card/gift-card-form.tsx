"use client";

import { useActionState } from "react";

import { GIFT_CARD_DEFAULTS } from "@/lib/domain/gift-card";

import { saveGiftCardAction, type ActionState } from "../actions/gift-card";
import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import { ErrorAlert, Field, SaveButton, inputClass } from "../promos/_kit/form-ui";

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
        <Field label="Judul" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={giftCard.title}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Subjudul"
          htmlFor="subtitle"
          hint={`Kalimat di bawah judul. Kosongkan untuk memakai: "${GIFT_CARD_DEFAULTS.subtitle}"`}
        >
          <input
            id="subtitle"
            name="subtitle"
            defaultValue={giftCard.subtitle}
            maxLength={200}
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

        <RichTextField
          name="termsHtml"
          label="Syarat & ketentuan (opsional)"
          folder="gift-card"
          defaultValue={giftCard.termsHtml}
        />

        <Field
          label="Pesan WhatsApp"
          htmlFor="whatsappMessage"
          hint={`Teks awal chat tombol "Pesan via WhatsApp". Kosongkan untuk memakai: "${GIFT_CARD_DEFAULTS.whatsappMessage}"`}
        >
          <input
            id="whatsappMessage"
            name="whatsappMessage"
            defaultValue={giftCard.whatsappMessage}
            maxLength={500}
            className={inputClass}
          />
        </Field>

        <ErrorAlert message={state.error} />

        <div className="border-t border-neutral-200 pt-4">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}
