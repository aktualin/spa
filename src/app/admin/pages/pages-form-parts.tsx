"use client";

import Link from "next/link";

import { deletePageAction } from "../actions/pages";
import { ConfirmSubmit } from "../settings/_components/form-ui";

/** Judul form halaman + tautan kembali. */
export function PageFormHeader({ isNew, title }: { isNew: boolean; title: string }) {
  return (
    <>
      <Link href="/admin/pages" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar halaman
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {isNew ? "Tambah halaman" : `Ubah halaman ${title}`}
      </h1>
    </>
  );
}

/** Form hapus halaman (dengan peringatan redirect & pemakaian menu). */
export function PageDeleteForm({
  pageId,
  title,
  slug,
  menuUsage,
}: {
  pageId: string;
  title: string;
  slug: string;
  menuUsage: number;
}) {
  return (
    <form action={deletePageAction} className="mt-8 border-t border-neutral-200 pt-4">
      <input type="hidden" name="id" value={pageId} />
      <ConfirmSubmit
        message={`Hapus halaman "${title}"? Alamat /${slug} akan menampilkan "halaman tidak ditemukan".${
          menuUsage > 0
            ? ` Halaman ini dipakai ${menuUsage} item menu navigasi; item tersebut akan disembunyikan dari situs dan ditandai "Tujuan hilang".`
            : ""
        } Tindakan ini tidak bisa dibatalkan.`}
      >
        Hapus halaman ini
      </ConfirmSubmit>
    </form>
  );
}