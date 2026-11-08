"use client";

import { useActionState, useState } from "react";

import {
  deleteWhatsAppTemplateAction,
  saveWhatsAppTemplateAction,
  type ActionState,
} from "../../actions/settings";
import {
  extractPlaceholders,
  buildWhatsAppLink,
  renderTemplate,
} from "@/lib/domain/whatsapp-template";
import {
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../_components/form-ui";

export type WhatsAppTemplateRow = {
  id: string;
  key: string;
  label: string;
  message: string;
};

const initialState: ActionState = { error: null };

/** Nilai contoh untuk preview placeholder. */
const SAMPLE_VALUES: Record<string, string> = {
  name: "Budi",
  customerName: "Budi",
  treatmentName: "Sukma Laya",
  treatment: "Sukma Laya",
  price: "Rp 145.000",
  priceIdr: "145000",
  duration: "60 menit",
  promoName: "Promo Ramadan",
  branch: "KAMA Spa Grand Indonesia",
  date: "Sabtu, 10 Mei 2026",
  time: "14.00",
};

export function WhatsAppTemplateList({
  templates,
  number,
}: {
  templates: WhatsAppTemplateRow[];
  number: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <WhatsAppTemplateForm key={template.id} template={template} number={number} />
      ))}

      {adding ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4">
          <WhatsAppTemplateForm
            template={null}
            number={number}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          + Tambah template
        </button>
      )}
    </div>
  );
}

function WhatsAppTemplateForm({
  template,
  number,
  onDone,
}: {
  template: WhatsAppTemplateRow | null;
  number: string;
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState(
    saveWhatsAppTemplateAction,
    initialState,
  );
  const [message, setMessage] = useState(template?.message ?? "");

  const placeholders = extractPlaceholders(message);
  const preview = renderTemplate(message, SAMPLE_VALUES);
  const link = number ? buildWhatsAppLink(preview, number) : null;

  return (
    <>
      <form
        action={formAction}
        className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4"
      >
      {template ? <input type="hidden" name="id" value={template.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Key"
          htmlFor={`key-${template?.id ?? "new"}`}
          hint="Huruf kecil, angka, dan tanda hubung."
        >
          <input
            id={`key-${template?.id ?? "new"}`}
            name="key"
            defaultValue={template?.key ?? ""}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={inputClass}
          />
        </Field>

        <Field label="Label" htmlFor={`label-${template?.id ?? "new"}`}>
          <input
            id={`label-${template?.id ?? "new"}`}
            name="label"
            defaultValue={template?.label ?? ""}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Pesan"
        htmlFor={`message-${template?.id ?? "new"}`}
        hint="Placeholder ditulis seperti {{nama}}."
      >
        <textarea
          id={`message-${template?.id ?? "new"}`}
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          required
          className={inputClass}
        />
      </Field>

      <div className="space-y-2 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
        <p>
          Placeholder terdeteksi:{" "}
          {placeholders.length > 0 ? (
            placeholders.map((name) => (
              <code
                key={name}
                className="mr-1 rounded bg-neutral-200 px-1 py-0.5 text-[11px]"
              >
                {`{{${name}}}`}
              </code>
            ))
          ) : (
            "tidak ada"
          )}
        </p>
        <p className="whitespace-pre-wrap text-neutral-700">Preview: {preview}</p>
        {link ? (
          <p className="truncate">
            Link:{" "}
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-800 underline"
            >
              {link}
            </a>
          </p>
        ) : (
          <p>
            Isi nomor WhatsApp di modul Kontak &amp; Umum agar preview link
            tersedia.
          </p>
        )}
      </div>

      <ErrorMessage error={state.error} />

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">
        <SaveButton label={template ? "Simpan template" : "Tambah template"} />
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-neutral-600 hover:underline"
          >
            Batal
          </button>
        ) : null}
      </div>
      </form>

      {template ? (
        <form action={deleteWhatsAppTemplateAction} className="mt-2">
          <input type="hidden" name="id" value={template.id} />
          <ConfirmSubmit message={`Hapus template "${template.label}"?`}>
            Hapus template
          </ConfirmSubmit>
        </form>
      ) : null}
    </>
  );
}
