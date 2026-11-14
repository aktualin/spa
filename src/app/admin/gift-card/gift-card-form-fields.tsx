"use client";

import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import { Field, inputClass } from "../promos/_kit/form-ui";
import type { GiftCardFormData } from "./gift-card-form";

/** Isian gift card: judul, subjudul, isi, gambar, S&K, dan pesan WhatsApp. */
export function GiftCardFields({ giftCard }: { giftCard: GiftCardFormData }) {
  return (
    <>
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
        hint="Kalimat di bawah judul. Dikosongkan → baris ini tidak tampil di halaman."
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
        hint='Teks awal chat tombol "Pesan via WhatsApp". Dikosongkan → memakai Template WhatsApp konteks "gift".'
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