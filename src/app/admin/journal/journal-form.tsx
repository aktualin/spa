"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { deletePostAction, savePostAction, type ActionState } from "../actions/journal";
import { JOURNAL_STATUSES } from "./journal-status";
import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  SeoFields,
  inputClass,
} from "../promos/_kit/form-ui";

export type JournalFormData = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverUrl: string;
  category: string;
  tags: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

const initialState: ActionState = { error: null };

const statusLabel: Record<JournalFormData["status"], string> = {
  DRAFT: "Draf — tidak tampil di website",
  SCHEDULED: "Terjadwal — terbit otomatis pada tanggalnya",
  PUBLISHED: "Terbit — langsung tampil di website",
};

export function JournalForm({ post }: { post: JournalFormData }) {
  const [state, formAction] = useActionState(savePostAction, initialState);
  const [status, setStatus] = useState<JournalFormData["status"]>(post.status);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/journal" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar artikel
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {post.id ? `Ubah artikel ${post.title}` : "Tulis artikel"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {post.id ? <input type="hidden" name="id" value={post.id} /> : null}

        <Field label="Judul artikel" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={post.title}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Kosongkan untuk dibuat otomatis dari judul. Huruf kecil, angka, dan tanda hubung."
        >
          <input
            id="slug"
            name="slug"
            defaultValue={post.slug}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field
          label="Ringkasan (excerpt)"
          htmlFor="excerpt"
          hint="Teks singkat yang tampil di daftar artikel."
        >
          <textarea
            id="excerpt"
            name="excerpt"
            defaultValue={post.excerpt}
            rows={3}
            className={inputClass}
          />
        </Field>

        <RichTextField
          name="bodyHtml"
          label="Isi artikel"
          folder="journal"
          defaultValue={post.bodyHtml}
        />

        <ImageField
          name="coverUrl"
          label="Gambar sampul"
          folder="journal"
          defaultValue={post.coverUrl}
        />

        <Field label="Kategori" htmlFor="category">
          <input
            id="category"
            name="category"
            defaultValue={post.category}
            placeholder="Contoh: Wellness"
            className={inputClass}
          />
        </Field>

        <Field
          label="Tag"
          htmlFor="tags"
          hint="Pisahkan dengan koma, contoh: wellness, medis, ritual."
        >
          <input
            id="tags"
            name="tags"
            defaultValue={post.tags}
            className={inputClass}
          />
        </Field>

        <Field label="Status" htmlFor="status">
          <select
            id="status"
            name="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as JournalFormData["status"])
            }
            className={inputClass}
          >
            {JOURNAL_STATUSES.map((value) => (
              <option key={value} value={value}>
                {statusLabel[value]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Tanggal publikasi"
          htmlFor="publishedAt"
          hint="Wajib untuk status Terjadwal. Untuk status Terbit tanpa tanggal, dipakai waktu sekarang."
        >
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={post.publishedAt}
            className={inputClass}
          />
        </Field>

        <SeoFields title={post.seoTitle} description={post.seoDescription} />

        <ErrorAlert message={state.error} />

        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          {post.id ? (
            <Link
              href={`/admin/journal/${post.id}/preview`}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Lihat preview
            </Link>
          ) : null}
          <Link href="/admin/journal" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {post.id ? (
        <form action={deletePostAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={post.id} />
          <ConfirmDeleteButton message="Hapus artikel ini? Sampul di storage juga dihapus.">
            Hapus artikel ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
