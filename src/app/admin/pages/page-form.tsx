"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { buildPreviewUrl, MAX_PAGE_SLUG_LENGTH, validatePageSlug } from "@/lib/domain/page-url";
import { slugify } from "@/lib/domain/slug";

import { deletePageAction, savePageAction, type ActionState } from "../actions/pages";
import { RichTextField } from "../rich-text-field";
import {
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../settings/_components/form-ui";
import { SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "./limits";

export type PageTemplateValue = "STANDARD" | "LEGAL";
export type PageStatusValue = "DRAFT" | "PUBLISHED";

export type PageFormData = {
  id: string | null;
  title: string;
  slug: string;
  template: PageTemplateValue;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
  status: PageStatusValue;
  /** true bila halaman pernah terbit — perubahan slug akan membuat redirect 301. */
  wasPublished: boolean;
};

const TEMPLATES: { value: PageTemplateValue; label: string; description: string }[] = [
  {
    value: "STANDARD",
    label: "Standar",
    description: "Judul dan isi teks berformat. Cocok untuk halaman informasi umum.",
  },
  {
    value: "LEGAL",
    label: "Dokumen legal",
    description:
      "Tata letak dokumen panjang seperti Kebijakan Privasi atau Syarat & Ketentuan.",
  },
];

const STATUSES: { value: PageStatusValue; label: string }[] = [
  { value: "DRAFT", label: "Draf — belum tampil di website" },
  { value: "PUBLISHED", label: "Terbit — tampil di website" },
];

const initialState: ActionState = { error: null };

function autoSlug(title: string): string {
  return slugify(title).slice(0, MAX_PAGE_SLUG_LENGTH).replace(/-+$/, "");
}

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={over ? "font-medium text-red-700" : undefined}>
      {value.length}/{max}
    </span>
  );
}

export function PageForm({ page, siteUrl }: { page: PageFormData; siteUrl: string }) {
  const [state, formAction] = useActionState(savePageAction, initialState);

  const isNew = page.id === null;
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [slugEdited, setSlugEdited] = useState(!isNew || page.slug !== "");
  const [template, setTemplate] = useState<PageTemplateValue>(page.template);
  const [status, setStatus] = useState<PageStatusValue>(page.status);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle);
  const [seoDescription, setSeoDescription] = useState(page.seoDescription);

  const slugError = slug === "" && !slugEdited ? null : validatePageSlug(slug);
  const previewUrl = buildPreviewUrl(siteUrl, slug);
  const slugChanged =
    page.wasPublished && !isNew && slug !== page.slug && slugError === null;
  const templateInfo = TEMPLATES.find((t) => t.value === template);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/pages" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar halaman
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {isNew ? "Tambah halaman" : `Ubah halaman ${page.title}`}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {page.id ? <input type="hidden" name="id" value={page.id} /> : null}

        <Field label="Judul halaman" htmlFor="title">
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugEdited) setSlug(autoSlug(event.target.value));
            }}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug (alamat URL)"
          htmlFor="slug"
          hint={
            isNew && !slugEdited
              ? "Terisi otomatis dari judul. Huruf kecil, angka, dan tanda hubung."
              : "Huruf kecil, angka, dan tanda hubung. Tanpa spasi atau garis miring."
          }
        >
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(true);
            }}
            required
            autoComplete="off"
            spellCheck={false}
            aria-invalid={slugError ? true : undefined}
            aria-describedby="slug-preview"
            className={`${inputClass} font-mono`}
          />
          <p id="slug-preview" aria-live="polite" className="text-xs">
            {slugError ? (
              <span className="text-red-700">{slugError}</span>
            ) : previewUrl ? (
              <>
                <span className="text-neutral-500">Alamat halaman: </span>
                <span className="break-all font-mono text-neutral-900">{previewUrl}</span>
              </>
            ) : (
              <span className="text-neutral-500">Isi judul atau slug untuk melihat alamat.</span>
            )}
          </p>
        </Field>

        {slugChanged ? (
          <p
            role="status"
            className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            URL lama /{page.slug} akan dialihkan permanen (301) ke /{slug} setelah
            disimpan.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Template" htmlFor="template" hint={templateInfo?.description}>
            <select
              id="template"
              name="template"
              value={template}
              onChange={(event) => setTemplate(event.target.value as PageTemplateValue)}
              className={inputClass}
            >
              {TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Status"
            htmlFor="status"
            hint="Halaman draf tidak bisa dibuka pengunjung."
          >
            <select
              id="status"
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PageStatusValue)}
              className={inputClass}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <RichTextField
          name="bodyHtml"
          label="Isi halaman"
          defaultValue={page.bodyHtml}
          folder="pages"
        />

        <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-medium text-neutral-700">SEO</legend>
          <Field
            label="Meta title"
            htmlFor="seoTitle"
            hint={
              <>
                Kosongkan untuk memakai judul halaman.{" "}
                <Counter value={seoTitle} max={SEO_TITLE_MAX} />
              </>
            }
          >
            <input
              id="seoTitle"
              name="seoTitle"
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Meta description"
            htmlFor="seoDescription"
            hint={
              <>
                Ringkasan untuk hasil pencarian Google.{" "}
                <Counter value={seoDescription} max={SEO_DESCRIPTION_MAX} />
              </>
            }
          >
            <textarea
              id="seoDescription"
              name="seoDescription"
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
        </fieldset>

        <ErrorMessage error={state.error} />

        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/pages" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {page.id ? (
        <form action={deletePageAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={page.id} />
          <ConfirmSubmit
            message={`Hapus halaman "${page.title}"? Alamat /${page.slug} akan menampilkan "halaman tidak ditemukan". Tindakan ini tidak bisa dibatalkan.`}
          >
            Hapus halaman ini
          </ConfirmSubmit>
        </form>
      ) : null}
    </div>
  );
}
