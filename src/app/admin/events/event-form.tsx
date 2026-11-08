"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { slugify } from "@/lib/domain/slug";

import {
  deleteEventAction,
  saveEventAction,
  type EventFormState,
} from "../actions/events";
import { ImageField } from "../image-field";
import {
  Checkbox,
  ConfirmDeleteButton,
  ErrorAlert,
  Field,
  SaveButton,
  SeoFields,
  inputClass,
} from "../promos/_kit/form-ui";
import { EventStatusRules } from "./status-rules";

export type EventFormData = {
  id: string | null;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  location: string;
  startDate: string;
  endDate: string;
  isCollaboration: boolean;
  partnerName: string;
  partnerLogoUrl: string;
  partnerUrl: string;
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
};

const initialState: EventFormState = { error: null };

export function EventForm({
  event,
  publishedSlug,
}: {
  event: EventFormData;
  /** Slug yang sedang tayang (event terbit) — untuk peringatan ganti slug. */
  publishedSlug?: string | null;
}) {
  const [state, formAction] = useActionState(saveEventAction, initialState);
  // Saat gagal, nilai yang dikirim dikembalikan server; form dipasang ulang
  // (key) supaya isian admin tidak hilang setelah React mereset form.
  const values = state.values ?? event;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/events" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar event
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {event.id ? `Ubah event ${event.title}` : "Tambah event"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5" key={state.attempt ?? 0}>
        <EventFields values={values} publishedSlug={publishedSlug ?? null} />

        <SeoFields title={values.seoTitle} description={values.seoDescription} />

        <ErrorAlert message={state.error} />

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
          <SaveButton />
          <Link href="/admin/events" className="text-sm text-neutral-600 hover:underline">
            Batal
          </Link>
        </div>
      </form>

      {event.id ? (
        <form action={deleteEventAction} className="mt-8 border-t border-neutral-200 pt-4">
          <input type="hidden" name="id" value={event.id} />
          <ConfirmDeleteButton message="Hapus event ini? Semua fotonya juga dihapus.">
            Hapus event ini
          </ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}

function EventFields({
  values,
  publishedSlug,
}: {
  values: EventFormData;
  publishedSlug: string | null;
}) {
  const isNew = !values.id;
  const [slug, setSlug] = useState(values.slug);
  // Event baru: slug mengikuti judul sampai admin mengubah slug sendiri.
  const [slugTouched, setSlugTouched] = useState(!isNew || values.slug !== "");
  const [startDate, setStartDate] = useState(values.startDate);
  const [isCollaboration, setIsCollaboration] = useState(values.isCollaboration);

  return (
    <>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <Field label="Judul event" htmlFor="title">
        <input
          id="title"
          name="title"
          defaultValue={values.title}
          required
          maxLength={200}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint={
          <>
            Alamat halaman: <code>/events/{slug || "…"}</code>. Huruf kecil, angka, dan
            tanda hubung; harus unik.
            {publishedSlug && slug !== publishedSlug ? (
              <span className="mt-1 block text-amber-700">
                Slug diganti: alamat lama <code>/events/{publishedSlug}</code> otomatis
                dialihkan (301) ke alamat baru setelah disimpan.
              </span>
            ) : null}
          </>
        }
      >
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.trim());
          }}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={inputClass}
        />
      </Field>

      <Field label="Deskripsi" htmlFor="description">
        <textarea
          id="description"
          name="description"
          defaultValue={values.description}
          rows={5}
          className={inputClass}
        />
      </Field>

      <ImageField
        name="coverUrl"
        label="Gambar sampul"
        folder="events"
        defaultValue={values.coverUrl}
      />

      <Field label="Lokasi" htmlFor="location">
        <input
          id="location"
          name="location"
          defaultValue={values.location}
          placeholder="Contoh: KAMA Spa, Jakarta Selatan"
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tanggal mulai (WIB)"
          htmlFor="startDate"
          hint="Kosongkan bila tanggal belum pasti (tampil “Tanggal menyusul”)."
        >
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Tanggal selesai (WIB)"
          htmlFor="endDate"
          hint="Opsional, untuk event lebih dari satu hari. Tidak boleh sebelum tanggal mulai."
        >
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={values.endDate}
            min={startDate || undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <EventStatusRules compact />

      <Field
        label="Urutan tampil"
        htmlFor="sortOrder"
        hint="Bawaan 0. Makin kecil makin atas di kelompoknya; bila sama, diurutkan menurut tanggal."
      >
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={values.sortOrder}
          className={`${inputClass} w-28`}
        />
      </Field>

      <div className="space-y-3 rounded-md border border-neutral-200 p-4">
        <label className="flex items-start gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="isCollaboration"
            checked={isCollaboration}
            onChange={(e) => setIsCollaboration(e.target.checked)}
            className="mt-0.5 size-4 rounded border-neutral-300"
          />
          <span>
            Event <strong>kolaborasi</strong> dengan mitra/brand/perusahaan. Setelah
            lewat, event pindah ke halaman <strong>Past Collaborations</strong>{" "}
            (<code>/events/collaborations</code>), bukan ke “Telah berlalu”.
          </span>
        </label>

        {/* Disembunyikan saja (tidak dilepas) supaya isian tidak hilang. */}
        <div className={isCollaboration ? "space-y-4 pt-2" : "hidden"}>
          <Field label="Nama mitra" htmlFor="partnerName">
            <input
              id="partnerName"
              name="partnerName"
              defaultValue={values.partnerName}
              placeholder="Contoh: PT Sehat Sentosa"
              className={inputClass}
            />
          </Field>
          <ImageField
            name="partnerLogoUrl"
            label="Logo mitra (opsional — hanya tampil bila diisi)"
            folder="events"
            defaultValue={values.partnerLogoUrl}
          />
          <Field
            label="Tautan mitra"
            htmlFor="partnerUrl"
            hint="Opsional. Situs/Instagram mitra, contoh: https://namabrand.com"
          >
            <input
              id="partnerUrl"
              name="partnerUrl"
              defaultValue={values.partnerUrl}
              inputMode="url"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <Checkbox name="isPublished" defaultChecked={values.isPublished}>
        Tampilkan di website
      </Checkbox>
    </>
  );
}
