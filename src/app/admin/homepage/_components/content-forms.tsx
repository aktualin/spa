"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";

import { INSTAGRAM_LIMITS, REVIEW_LIMITS, STAT_LIMITS } from "@/lib/domain/homepage";

import {
  deleteHomepageReviewAction,
  deleteHomepageStatAction,
  deleteInstagramPostAction,
  saveHomepageReviewAction,
  saveHomepageStatAction,
  saveInstagramPostAction,
  type ActionState,
} from "../../actions/homepage-content";
import { ImageField } from "../../image-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  inputClass,
} from "../../promos/_kit/form-ui";

const initialState: ActionState = { error: null };

function Shell({
  listPath,
  backLabel,
  heading,
  intro,
  id,
  formAction,
  error,
  children,
  deleteAction,
  deleteMessage,
  deleteLabel,
}: {
  listPath: string;
  backLabel: string;
  heading: string;
  intro: string;
  id: string | null;
  formAction: (formData: FormData) => void;
  error: string | null;
  children: ReactNode;
  deleteAction: (formData: FormData) => void | Promise<void>;
  deleteMessage: string;
  deleteLabel: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={listPath} className="text-sm text-neutral-600 hover:underline">
        ← {backLabel}
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-neutral-900">{heading}</h1>
      <p className="mt-1 text-sm text-neutral-600">{intro}</p>

      <form action={formAction} className="mt-6 space-y-5">
        {id ? <input type="hidden" name="id" value={id} /> : null}
        {children}
        <ErrorAlert message={error} />
        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href={listPath} className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {id ? (
        <form action={deleteAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={id} />
          <ConfirmDeleteButton message={deleteMessage}>{deleteLabel}</ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}

export type StatFormData = { id: string | null; value: string; label: string; isPublished: boolean };

export function StatForm({ stat }: { stat: StatFormData }) {
  const [state, formAction] = useActionState(saveHomepageStatAction, initialState);
  return (
    <Shell
      listPath="/admin/homepage/stats"
      backLabel="Kembali ke daftar statistik"
      heading={stat.id ? "Ubah statistik" : "Tambah statistik"}
      intro="Tampil sebagai kotak angka di section Brand Intro (“KAMA at a glance”)."
      id={stat.id}
      formAction={formAction}
      error={state.error}
      deleteAction={deleteHomepageStatAction}
      deleteMessage="Hapus statistik ini?"
      deleteLabel="Hapus statistik ini"
    >
      <Field label="Angka / nilai" htmlFor="value" hint="Mis. 12 atau 40+.">
        <input
          id="value"
          name="value"
          defaultValue={stat.value}
          required
          maxLength={STAT_LIMITS.value}
          className={inputClass}
        />
      </Field>
      <Field label="Label" htmlFor="label" hint="Mis. years of care. Ditampilkan di bawah angka.">
        <input
          id="label"
          name="label"
          defaultValue={stat.label}
          required
          maxLength={STAT_LIMITS.label}
          className={inputClass}
        />
      </Field>
      <Checkbox name="isPublished" defaultChecked={stat.isPublished}>
        Terbitkan di homepage
      </Checkbox>
    </Shell>
  );
}

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

export type InstagramFormData = {
  id: string | null;
  imageUrl: string;
  imageAlt: string;
  href: string;
  isPublished: boolean;
};

export function InstagramForm({ post }: { post: InstagramFormData }) {
  const [state, formAction] = useActionState(saveInstagramPostAction, initialState);
  return (
    <Shell
      listPath="/admin/homepage/instagram"
      backLabel="Kembali ke daftar foto"
      heading={post.id ? "Ubah foto Instagram" : "Tambah foto Instagram"}
      intro="Tampil sebagai kotak foto persegi di section feed Instagram."
      id={post.id}
      formAction={formAction}
      error={state.error}
      deleteAction={deleteInstagramPostAction}
      deleteMessage="Hapus foto ini dari feed? Gambar yang tercatat di Media Library tetap tersimpan."
      deleteLabel="Hapus foto ini"
    >
      <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
        <legend className="px-1 text-sm font-medium text-neutral-700">Foto</legend>
        <ImageField
          name="imageUrl"
          label="Foto feed"
          folder="instagram"
          defaultValue={post.imageUrl}
        />
        <p className="text-xs text-neutral-500">
          Dipotong persegi 1:1. Disarankan minimal 800×800 px, JPG/WebP di bawah 1 MB.
        </p>
        <Field
          label="Teks alt (opsional)"
          htmlFor="imageAlt"
          hint="Deskripsi singkat foto untuk pembaca layar. Kosong = foto dianggap hiasan."
        >
          <input
            id="imageAlt"
            name="imageAlt"
            defaultValue={post.imageAlt}
            maxLength={INSTAGRAM_LIMITS.imageAlt}
            className={inputClass}
          />
        </Field>
      </fieldset>
      <Field
        label="Tautan postingan (opsional)"
        htmlFor="href"
        hint="https://… ke postingan Instagram. Kosong = tautan profil Instagram (dari Kontak & Umum)."
      >
        <input
          id="href"
          name="href"
          defaultValue={post.href}
          maxLength={INSTAGRAM_LIMITS.href}
          className={inputClass}
        />
      </Field>
      <Checkbox name="isPublished" defaultChecked={post.isPublished}>
        Terbitkan di homepage
      </Checkbox>
    </Shell>
  );
}
