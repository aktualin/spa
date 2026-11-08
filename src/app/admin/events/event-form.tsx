"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  deleteEventAction,
  saveEventAction,
  type ActionState,
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
  isPublished: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
};

const initialState: ActionState = { error: null };

export function EventForm({ event }: { event: EventFormData }) {
  const [state, formAction] = useActionState(saveEventAction, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/events" className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar event
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {event.id ? `Ubah event ${event.title}` : "Tambah event"}
      </h1>

      <form action={formAction} className="mt-6 space-y-5">
        {event.id ? <input type="hidden" name="id" value={event.id} /> : null}

        <Field label="Judul event" htmlFor="title">
          <input
            id="title"
            name="title"
            defaultValue={event.title}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          hint="Dipakai di URL. Huruf kecil, angka, dan tanda hubung."
        >
          <input
            id="slug"
            name="slug"
            defaultValue={event.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field label="Deskripsi" htmlFor="description">
          <textarea
            id="description"
            name="description"
            defaultValue={event.description}
            rows={4}
            className={inputClass}
          />
        </Field>

        <ImageField
          name="coverUrl"
          label="Gambar sampul"
          folder="events"
          defaultValue={event.coverUrl}
        />

        <Field label="Lokasi" htmlFor="location">
          <input
            id="location"
            name="location"
            defaultValue={event.location}
            placeholder="Contoh: KAMA Spa, Jakarta Selatan"
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mulai" htmlFor="startDate">
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={event.startDate}
              className={inputClass}
            />
          </Field>

          <Field
            label="Berakhir"
            htmlFor="endDate"
            hint="Harus lebih besar dari tanggal mulai."
          >
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={event.endDate}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Urutan tampil" htmlFor="sortOrder">
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={event.sortOrder}
            className={`${inputClass} w-28`}
          />
        </Field>

        <div className="space-y-2">
          <Checkbox name="isCollaboration" defaultChecked={event.isCollaboration}>
            Tandai sebagai <strong>kolaborasi</strong> (tampil di halaman Past
            Collaborations)
          </Checkbox>
          <Checkbox name="isPublished" defaultChecked={event.isPublished}>
            Tampilkan di website
          </Checkbox>
        </div>

        <SeoFields title={event.seoTitle} description={event.seoDescription} />

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
