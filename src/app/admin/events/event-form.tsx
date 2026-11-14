"use client";

import Link from "next/link";
import { useActionState } from "react";

import { deleteEventAction, saveEventAction } from "../actions/events";
import {
  ConfirmDeleteButton,
  ErrorAlert,
  SaveButton,
  SeoFields,
} from "../promos/_kit/form-ui";
import { EventFields } from "./event-form-fields";
import { initialState, type EventFormData } from "./event-form.types";

export type { EventFormData } from "./event-form.types";

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