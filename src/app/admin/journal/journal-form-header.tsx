"use client";

import Link from "next/link";

import { ImageField } from "../image-field";
import { RichTextField } from "../rich-text-field";
import type { JournalFormData } from "./journal-form.types";

/** Gambar sampul artikel + keterangan pemakaiannya. */
export function CoverField({ coverUrl }: { coverUrl: string }) {
  return (
    <div className="space-y-1.5">
      <ImageField
        name="coverUrl"
        label="Gambar sampul"
        folder="journal"
        defaultValue={coverUrl}
      />
      <p className="text-xs text-neutral-500">
        Tampil di daftar dan di atas artikel, sekaligus menjadi gambar pratinjau saat
        tautan artikel dibagikan (WhatsApp, Facebook, dsb.).
      </p>
    </div>
  );
}

/** Judul form artikel + tautan kembali. */
export function JournalFormHeader({ post }: { post: JournalFormData }) {
  return (
    <>
      <Link href="/admin/journal" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar artikel
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {post.id ? `Ubah artikel ${post.title}` : "Tulis artikel"}
      </h1>
    </>
  );
}

/** Isi artikel (editor teks kaya) + keterangan tombol gambar. */
export function ArticleBodyField({ bodyHtml }: { bodyHtml: string }) {
  return (
    <>
      <RichTextField
        name="bodyHtml"
        label="Isi artikel"
        folder="journal"
        defaultValue={bodyHtml}
      />
      <p className="-mt-3 text-xs text-neutral-500">
        Tombol <strong>Gambar</strong> di editor menyisipkan gambar di dalam isi artikel
        (JPG/PNG/WebP/AVIF/GIF, maksimal 4 MB).
      </p>
    </>
  );
}