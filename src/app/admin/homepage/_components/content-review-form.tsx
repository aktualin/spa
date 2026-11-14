"use client";

import { useActionState } from "react";

import { REVIEW_LIMITS } from "@/lib/domain/homepage";

import {
  deleteHomepageReviewAction,
  saveHomepageReviewAction,
} from "../../actions/homepage-content";
import { Checkbox, Field, inputClass } from "../../promos/_kit/form-ui";
import { Shell, initialState } from "./content-form-shell";

export type ReviewFormData = {
  id: string | null;
  quote: string;
  name: string;
  location: string;
  role: string;
  isPublished: boolean;
};

export function ReviewForm({ review }: { review: ReviewFormData }) {
  const [state, formAction] = useActionState(saveHomepageReviewAction, initialState);
  return (
    <Shell
      listPath="/admin/homepage/reviews"
      backLabel="Kembali ke daftar ulasan"
      heading={review.id ? "Ubah ulasan" : "Tambah ulasan"}
      intro="Tampil sebagai kartu di carousel section Reviews."
      id={review.id}
      formAction={formAction}
      error={state.error}
      deleteAction={deleteHomepageReviewAction}
      deleteMessage="Hapus ulasan ini?"
      deleteLabel="Hapus ulasan ini"
    >
      <Field label="Isi ulasan" htmlFor="quote" hint="Tanda kutip ditambahkan otomatis.">
        <textarea
          id="quote"
          name="quote"
          defaultValue={review.quote}
          required
          rows={5}
          maxLength={REVIEW_LIMITS.quote}
          className={inputClass}
        />
      </Field>
      <Field label="Nama" htmlFor="name">
        <input
          id="name"
          name="name"
          defaultValue={review.name}
          required
          maxLength={REVIEW_LIMITS.name}
          className={inputClass}
        />
      </Field>
      <Field label="Lokasi (opsional)" htmlFor="location" hint="Mis. Jakarta | Sudirman.">
        <input
          id="location"
          name="location"
          defaultValue={review.location}
          maxLength={REVIEW_LIMITS.location}
          className={inputClass}
        />
      </Field>
      <Field label="Keterangan (opsional)" htmlFor="role" hint="Mis. Guest. Teks kecil huruf kapital.">
        <input
          id="role"
          name="role"
          defaultValue={review.role}
          maxLength={REVIEW_LIMITS.role}
          className={inputClass}
        />
      </Field>
      <Checkbox name="isPublished" defaultChecked={review.isPublished}>
        Terbitkan di homepage
      </Checkbox>
    </Shell>
  );
}