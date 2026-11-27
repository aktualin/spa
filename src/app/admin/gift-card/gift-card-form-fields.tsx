"use client";

import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import { Field, inputClass } from "../promos/_kit/form-ui";
import type { GiftCardFormData } from "./gift-card-form";

/** Isian gift card: judul, subjudul, isi, gambar, S&K, dan pesan WhatsApp. */
export function GiftCardFields({ giftCard }: { giftCard: GiftCardFormData }) {
  return (
    <>
      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          defaultValue={giftCard.title}
          required
          className={inputClass}
        />
      </Field>

      <Field
        label="Subtitle"
        htmlFor="subtitle"
        hint="The line under the title. Leave empty → this line is not shown on the page."
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
        label="Gift card content"
        folder="gift-card"
        defaultValue={giftCard.bodyHtml}
      />

      <ImageField
        name="imageUrl"
        label="Gift card image"
        folder="gift-card"
        defaultValue={giftCard.imageUrl}
      />

      <RichTextField
        name="termsHtml"
        label="Terms & conditions (optional)"
        folder="gift-card"
        defaultValue={giftCard.termsHtml}
      />

      <Field
        label="WhatsApp message"
        htmlFor="whatsappMessage"
        hint='Opening chat text for the "Order via WhatsApp" button. Leave empty → uses the WhatsApp Template with the "gift" context.'
      >
        <input
          id="whatsappMessage"
          name="whatsappMessage"
          defaultValue={giftCard.whatsappMessage}
          maxLength={500}
          className={inputClass}
        />
      </Field>
    </>
  );
}