"use client";

import {
  createCustomSectionAction,
  createHomepageSectionAction,
} from "../actions/homepage";
import { inputClass } from "../settings/_components/form-ui";
import { isDefaultVisibleSection } from "@/lib/domain/homepage";
import { sectionKeyLabel } from "./homepage-sections";

/** Tombol-tombol section bawaan yang belum punya baris di DB. */
export function AddMissingSections({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;
  return (
    <section className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <h2 className="text-sm font-semibold text-neutral-800">
        Tambahkan section
      </h2>
      <p className="mt-1 text-xs text-neutral-600">
        Status awal mengikuti homepage sekarang: section bawaan yang sudah
        tampil (mis. Footer) dibuat <strong>aktif</strong>, section baru
        dibuat <strong>mati</strong> sampai admin menyalakannya. Jadi
        homepage tidak berubah saat tombol ini ditekan.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {missing.map((key) => (
          <li key={key}>
            <form action={createHomepageSectionAction}>
              <input type="hidden" name="key" value={key} />
              <button
                type="submit"
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
              >
                Tambahkan {sectionKeyLabel(key)}
                {isDefaultVisibleSection(key) ? " (aktif)" : " (mati)"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Form pembuat section konten bebas (key `custom-<slug>`). */
export function AddCustomSection() {
  return (
    <section className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <h2 className="text-sm font-semibold text-neutral-800">Tambah section konten</h2>
      <p className="mt-1 text-xs text-neutral-600">
        Section bebas berisi judul, subjudul, isi berformat (HTML), gambar, dan tombol.
        Dibuat dalam keadaan <strong>mati</strong> — isi dulu, lalu nyalakan dan atur
        urutannya. Section konten bisa dihapus kapan saja.
      </p>
      <form action={createCustomSectionAction} className="mt-3 flex flex-wrap gap-2">
        <label htmlFor="custom-section-name" className="sr-only">
          Nama section
        </label>
        <input
          id="custom-section-name"
          name="name"
          required
          maxLength={120}
          placeholder="mis. Ritual Musim Hujan"
          className={`${inputClass} max-w-xs`}
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Tambah section
        </button>
      </form>
    </section>
  );
}