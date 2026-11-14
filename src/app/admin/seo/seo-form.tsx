"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { deletePageSeoAction, savePageSeoAction } from "../actions/seo";
import { ImageField } from "../image-field";
import {
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";
import { SeoTextFields } from "./seo-form-preview";
import { initialState, type PageSeoFormData } from "./seo-form.types";

export type { PageSeoFormData } from "./seo-form.types";

export function PageSeoForm({ entry }: { entry: PageSeoFormData }) {
  const [state, formAction] = useActionState(savePageSeoAction, initialState);
  const [title, setTitle] = useState(entry.title);
  const [description, setDescription] = useState(entry.description);

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
          hint={'Alamat halaman di situs ini, diawali "/", contoh: /contact. Untuk treatment, artikel, event, promo, dan halaman, gunakan field SEO di modulnya.'}
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

        <SeoTextFields
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
        />

        <ImageField
          name="ogImageUrl"
          label="Gambar OG"
          folder="seo"
          defaultValue={entry.ogImageUrl}
        />
        <p className="text-xs text-neutral-500">
          Gambar saat tautan halaman ini dibagikan (ideal 1200×630). Kosong =
          gambar halaman itu sendiri, atau gambar OG bawaan dari pengaturan.
        </p>

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