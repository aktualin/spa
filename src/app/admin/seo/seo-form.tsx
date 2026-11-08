"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  deletePageSeoAction,
  savePageSeoAction,
  type ActionState,
} from "../actions/seo";
import { ImageField } from "../image-field";
import { assessSeoText, formatPageTitle } from "@/lib/domain/seo";
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

  const renderedTitle = title.trim() ? formatPageTitle(title) : "";
  const titleCheck = assessSeoText(renderedTitle, "title");
  const descriptionCheck = assessSeoText(description, "description");
  const toneOf = (status: string) =>
    status === "long" ? "text-xs text-amber-700" : "text-xs text-neutral-500";

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

        <Field
          label="Meta title"
          htmlFor="title"
          hint="Akhiran “ • KAMA Spa” ditambahkan otomatis (kecuali judul sudah memuat “KAMA Spa”). Idealnya total ≤ 60 karakter."
        >
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
          />
        </Field>
        <p className={toneOf(titleCheck.status)}>
          {titleCheck.status === "empty"
            ? "Kosong — halaman memakai judul bawaannya."
            : `Tampil sebagai “${renderedTitle}”. ${titleCheck.message}`}
        </p>

        <Field
          label="Meta description"
          htmlFor="description"
          hint="Ringkasan di hasil pencarian. Idealnya 70–160 karakter."
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
        <p className={toneOf(descriptionCheck.status)}>{descriptionCheck.message}</p>

        {renderedTitle || description.trim() ? (
          <div className="rounded-md border border-neutral-200 bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-neutral-400">
              Pratinjau hasil pencarian
            </p>
            <p className="mt-1 truncate text-base text-blue-800">
              {renderedTitle || "(judul bawaan halaman)"}
            </p>
            <p className="line-clamp-2 text-sm text-neutral-600">
              {description.trim() || "(description bawaan halaman)"}
            </p>
          </div>
        ) : null}

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
