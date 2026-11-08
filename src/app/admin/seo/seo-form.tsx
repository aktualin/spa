"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  deletePageSeoAction,
  savePageSeoAction,
  type ActionState,
} from "../actions/seo";
import { ImageField } from "../image-field";
import {
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";

export type PageSeoFormData = {
  id: string | null;
  path: string;
  title: string;
  description: string;
  ogImageUrl: string;
};

const initialState: ActionState = { error: null };

export function PageSeoForm({ entry }: { entry: PageSeoFormData }) {
  const [state, formAction] = useActionState(savePageSeoAction, initialState);
  const [title, setTitle] = useState(entry.title);
  const [description, setDescription] = useState(entry.description);

  const titleLength = title.length;
  const descriptionLength = description.length;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/seo" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {entry.id ? `SEO ${entry.path}` : "Tambah entri SEO"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {entry.id ? <input type="hidden" name="id" value={entry.id} /> : null}

        <Field
          label="Path"
          htmlFor="path"
          hint={'Harus diawali "/", contoh: /contact'}
        >
          <input
            id="path"
            name="path"
            defaultValue={entry.path}
            required
            placeholder="/contact"
            className={inputClass}
          />
        </Field>

        <Field
          label="Meta title"
          htmlFor="title"
          hint="Idealnya 60 karakter atau kurang."
        >
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
          />
        </Field>
        <p
          className={
            titleLength > 60
              ? "text-xs text-amber-700"
              : "text-xs text-neutral-500"
          }
        >
          {titleLength} karakter{titleLength > 60 ? " — terlalu panjang." : "."}
        </p>

        <Field
          label="Meta description"
          htmlFor="description"
          hint="Idealnya 160 karakter atau kurang."
        >
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className={inputClass}
          />
        </Field>
        <p
          className={
            descriptionLength > 160
              ? "text-xs text-amber-700"
              : "text-xs text-neutral-500"
          }
        >
          {descriptionLength} karakter
          {descriptionLength > 160 ? " — terlalu panjang." : "."}
        </p>

        <ImageField
          name="ogImageUrl"
          label="Gambar OG"
          folder="seo"
          defaultValue={entry.ogImageUrl}
        />

        <ErrorMessage error={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/seo" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {entry.id ? (
        <form action={deletePageSeoAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={entry.id} />
          <ConfirmSubmit message={`Hapus entri SEO untuk ${entry.path}?`}>
            Hapus entri ini
          </ConfirmSubmit>
        </form>
      ) : null}
    </div>
  );
}
