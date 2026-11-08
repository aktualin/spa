"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";

import {
  JOURNAL_EXCERPT_MAX,
  JOURNAL_SEO_DESCRIPTION_IDEAL,
  JOURNAL_SEO_DESCRIPTION_MAX,
  JOURNAL_SEO_TITLE_IDEAL,
  JOURNAL_SEO_TITLE_MAX,
  journalPath,
  parseJournalTags,
  resolveJournalSlug,
  seoLengthState,
  type SeoLengthState,
} from "@/lib/domain/journal";

import { deletePostAction, savePostAction, type ActionState } from "../actions/journal";
import { JOURNAL_STATUSES } from "./journal-status";
import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
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
  /** Artikel sedang tampil di website (menentukan peringatan ganti slug). */
  isPublic: boolean;
};

const initialState: ActionState = { error: null };

const statusLabel: Record<JournalFormData["status"], string> = {
  DRAFT: "Draf — tidak tampil di website",
  SCHEDULED: "Terjadwal — terbit otomatis pada tanggalnya",
  PUBLISHED: "Terbit — tampil di website",
};

const scheduleHint: Record<JournalFormData["status"], string> = {
  DRAFT: "Opsional sebagai rencana; artikel draf tidak pernah tampil.",
  SCHEDULED:
    "Wajib. Artikel tampil otomatis pada waktu ini (WIB) tanpa perlu disimpan ulang. Bila tanggalnya sudah lewat, artikel langsung terbit.",
  PUBLISHED:
    "Kosongkan untuk memakai waktu sekarang. Bila diisi tanggal di masa depan, artikel otomatis menjadi Terjadwal.",
};

const seoTone: Record<SeoLengthState, string> = {
  empty: "text-neutral-500",
  short: "text-amber-700",
  ideal: "text-green-700",
  long: "font-medium text-red-700",
};

const seoText: Record<SeoLengthState, string> = {
  empty: "memakai nilai bawaan",
  short: "terlalu pendek",
  ideal: "panjang ideal",
  long: "terlalu panjang, bisa terpotong di Google",
};

function SeoCounter({ value, ideal }: { value: string; ideal: number }) {
  const state = seoLengthState(value.trim().length, ideal);
  return (
    <span className={seoTone[state]}>
      {value.trim().length}/{ideal} karakter · {seoText[state]}
    </span>
  );
}

export function JournalForm({
  post,
  taxonomy,
}: {
  post: JournalFormData;
  taxonomy: { categories: string[]; tags: string[] };
}) {
  const [state, formAction] = useActionState(savePostAction, initialState);
  const [status, setStatus] = useState<JournalFormData["status"]>(post.status);
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [tags, setTags] = useState(post.tags);
  // Field dibuat terkendali supaya isian tidak hilang ketika simpan ditolak
  // (React mengosongkan field tak terkendali setelah form action selesai).
  const [category, setCategory] = useState(post.category);
  const [publishedAt, setPublishedAt] = useState(post.publishedAt);
  const [seoTitle, setSeoTitle] = useState(post.seoTitle);
  const [seoDescription, setSeoDescription] = useState(post.seoDescription);
  const categoryListId = useId();

  const effectiveSlug = resolveJournalSlug(slug, title);
  const slugChanged = post.isPublic && post.slug !== "" && effectiveSlug !== post.slug;
  const currentTags = parseJournalTags(tags).tags;
  const suggestedTags = taxonomy.tags.filter((tag) => !currentTags.includes(tag)).slice(0, 15);

  function addTag(tag: string) {
    setTags([...currentTags, tag].join(", "));
  }

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
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint={
            <>
              Kosongkan untuk dibuat otomatis dari judul. Huruf kecil, angka, dan tanda hubung.
              {effectiveSlug ? (
                <>
                  {" "}Alamat: <code>{journalPath(effectiveSlug)}</code>
                </>
              ) : null}
              {slugChanged ? (
                <span className="mt-1 block text-amber-700">
                  Artikel ini sudah tampil di website. Setelah disimpan, alamat lama{" "}
                  <code>{journalPath(post.slug)}</code> otomatis dialihkan (301) ke alamat baru.
                </span>
              ) : null}
            </>
          }
        >
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder={resolveJournalSlug("", title) || undefined}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={80}
            className={inputClass}
          />
        </Field>

        <Field
          label="Ringkasan (excerpt)"
          htmlFor="excerpt"
          hint={`Teks singkat yang tampil di daftar artikel. ${excerpt.length}/${JOURNAL_EXCERPT_MAX} karakter.`}
        >
          <textarea
            id="excerpt"
            name="excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            maxLength={JOURNAL_EXCERPT_MAX}
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
        <p className="-mt-3 text-xs text-neutral-500">
          Tombol <strong>Gambar</strong> di editor menyisipkan gambar di dalam isi artikel
          (JPG/PNG/WebP/AVIF/GIF, maksimal 4 MB).
        </p>

        <div className="space-y-1.5">
          <ImageField
            name="coverUrl"
            label="Gambar sampul"
            folder="journal"
            defaultValue={post.coverUrl}
          />
          <p className="text-xs text-neutral-500">
            Tampil di daftar dan di atas artikel, sekaligus menjadi gambar pratinjau saat
            tautan artikel dibagikan (WhatsApp, Facebook, dsb.).
          </p>
        </div>

        <Field
          label="Kategori"
          htmlFor="category"
          hint="Pilih kategori yang sudah ada atau ketik kategori baru. Satu artikel satu kategori."
        >
          <input
            id="category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            list={categoryListId}
            maxLength={50}
            placeholder="Contoh: Wellness"
            autoComplete="off"
            className={inputClass}
          />
          <datalist id={categoryListId}>
            {taxonomy.categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </Field>

        <Field
          label="Tag"
          htmlFor="tags"
          hint="Pisahkan dengan koma, contoh: wellness, pijat, ritual. Disimpan dalam huruf kecil tanpa duplikat; maksimal 20 tag."
        >
          <input
            id="tags"
            name="tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className={inputClass}
          />
          {suggestedTags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-neutral-500">Tag yang sudah dipakai:</span>
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  + {tag}
                </button>
              ))}
            </div>
          ) : null}
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
          label="Tanggal publikasi (WIB)"
          htmlFor="publishedAt"
          hint={scheduleHint[status]}
        >
          <input
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            required={status === "SCHEDULED"}
            className={inputClass}
          />
        </Field>

        <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-medium text-neutral-700">SEO</legend>
          <Field
            label="Meta title"
            htmlFor="seoTitle"
            hint={
              <>
                Kosongkan untuk memakai judul artikel. Ideal ±{JOURNAL_SEO_TITLE_IDEAL}{" "}
                karakter. <SeoCounter value={seoTitle} ideal={JOURNAL_SEO_TITLE_IDEAL} />
              </>
            }
          >
            <input
              id="seoTitle"
              name="seoTitle"
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              maxLength={JOURNAL_SEO_TITLE_MAX}
              className={inputClass}
            />
          </Field>
          <Field
            label="Meta description"
            htmlFor="seoDescription"
            hint={
              <>
                Kosongkan untuk memakai ringkasan. Ideal ±{JOURNAL_SEO_DESCRIPTION_IDEAL}{" "}
                karakter.{" "}
                <SeoCounter value={seoDescription} ideal={JOURNAL_SEO_DESCRIPTION_IDEAL} />
              </>
            }
          >
            <textarea
              id="seoDescription"
              name="seoDescription"
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
              maxLength={JOURNAL_SEO_DESCRIPTION_MAX}
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="rounded-md bg-neutral-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">
              Perkiraan tampilan di Google
            </p>
            <p className="mt-1 truncate text-sm text-blue-800">
              {seoTitle.trim() || title.trim() || "Judul artikel"}
            </p>
            <p className="truncate text-xs text-green-800">
              {journalPath(effectiveSlug || "slug-artikel")}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600">
              {seoDescription.trim() || excerpt.trim() || "Ringkasan artikel akan tampil di sini."}
            </p>
          </div>
        </fieldset>

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
          <ConfirmDeleteButton message="Hapus artikel ini? Sampul di storage juga dihapus (kecuali berkas Media Library), dan artikel tidak bisa dipulihkan.">
            Hapus artikel ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
