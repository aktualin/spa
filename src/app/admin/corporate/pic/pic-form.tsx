"use client";

import Link from "next/link";
import { useActionState } from "react";

import { savePicAction, type ActionState } from "../../actions/corporate";
import { ErrorAlert, Field, SaveButton, inputClass } from "../../promos/_kit/form-ui";

const initialState: ActionState = { error: null };

export function CorporatePicForm({
  pic,
}: {
  pic: { name: string; email: string; phone: string };
}) {
  const [state, formAction] = useActionState(savePicAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <Field label="Nama PIC" htmlFor="picName" hint='Tampil sebagai "Talk to {nama}".'>
        <input
          id="picName"
          name="picName"
          defaultValue={pic.name}
          required
          maxLength={80}
          className={inputClass}
        />
      </Field>

      <Field
        label="Email PIC"
        htmlFor="picEmail"
        hint="Tampil di halaman /corporate dan menjadi penerima email inquiry bila CORPORATE_INQUIRY_TO di server tidak diisi."
      >
        <input
          id="picEmail"
          name="picEmail"
          type="email"
          defaultValue={pic.email}
          required
          maxLength={254}
          className={inputClass}
        />
      </Field>

      <Field
        label="Telepon / WhatsApp PIC"
        htmlFor="picPhone"
        hint="8–15 digit, mis. +62 813-1485-6565 atau 0813-1485-6565. Tombol Talk to … membuka WhatsApp ke nomor ini."
      >
        <input
          id="picPhone"
          name="picPhone"
          type="tel"
          defaultValue={pic.phone}
          required
          maxLength={30}
          className={inputClass}
        />
      </Field>

      <ErrorAlert message={state.error} />

      <div className="flex items-center gap-3 border-t border-neutral-200 pt-4">
        <SaveButton />
        <Link href="/admin/corporate" className="text-sm text-neutral-600 hover:underline">
          Batal
        </Link>
      </div>
    </form>
  );
}
