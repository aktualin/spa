"use client";

import { useActionState, useState } from "react";

import {
  deleteWhatsAppTemplateAction,
  saveWhatsAppTemplateAction,
  type WhatsAppTemplateActionState,
} from "../../actions/whatsapp-templates";
import {
  MAX_TEMPLATE_LENGTH,
  buildWhatsAppLink,
  fillTemplate,
  getContextDefinition,
  sampleValues,
  validateTemplate,
  type WhatsAppContextKey,
} from "@/lib/domain/whatsapp-template";
import {
  ConfirmSubmit,
  ErrorMessage,
  Field,
  SaveButton,
  inputClass,
} from "../_components/form-ui";

export type WhatsAppContextRow = {
  key: WhatsAppContextKey;
  /** Isi template di DB; `null` = belum tersimpan (website memakai teks bawaan). */
  message: string | null;
};

export type OtherTemplateRow = {
  id: string;
  key: string;
  label: string;
  message: string;
};

const initialState: WhatsAppTemplateActionState = { error: null };

export function WhatsAppTemplateList({
  templates,
  others,
  number,
}: {
  templates: WhatsAppContextRow[];
  others: OtherTemplateRow[];
  number: string;
}) {
  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <WhatsAppTemplateForm key={template.key} template={template} number={number} />
      ))}

      {others.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-neutral-900">
            Template lain (tidak dipakai website)
          </h2>
          {others.map((row) => (
            <div key={row.id} className="border-t border-neutral-100 pt-3 text-sm">
              <p className="font-medium text-neutral-800">
                {row.label} <code className="text-xs text-neutral-500">{row.key}</code>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-neutral-600">{row.message}</p>
              <form action={deleteWhatsAppTemplateAction} className="mt-2">
                <input type="hidden" name="id" value={row.id} />
                <ConfirmSubmit message={`Hapus template "${row.label}"?`}>
                  Hapus template
                </ConfirmSubmit>
              </form>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WhatsAppTemplateForm({
  template,
  number,
}: {
  template: WhatsAppContextRow;
  number: string;
}) {
  const context = getContextDefinition(template.key);
  const [state, formAction] = useActionState(saveWhatsAppTemplateAction, initialState);
  const [message, setMessage] = useState(template.message ?? context.builtIn);

  const { errors, warnings } = validateTemplate(template.key, message);
  const preview = fillTemplate(message, sampleValues(template.key));
  const link = buildWhatsAppLink(preview, number);
  const fieldId = `message-${template.key}`;

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <input type="hidden" name="key" value={template.key} />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-900">
          {context.label}{" "}
          <code className="text-xs font-normal text-neutral-500">{context.key}</code>
        </h2>
        {template.message === null ? (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            Belum tersimpan — memakai teks bawaan
          </span>
        ) : null}
      </div>
      <p className="text-xs text-neutral-500">Dipakai di: {context.usedOn}</p>

      <Field
        label="Pesan"
        htmlFor={fieldId}
        hint={`${message.trim().length}/${MAX_TEMPLATE_LENGTH} karakter.`}
      >
        <textarea
          id={fieldId}
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          required
          maxLength={MAX_TEMPLATE_LENGTH + 200}
          className={inputClass}
        />
      </Field>

      <div className="space-y-2 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
        <p>
          Placeholder tersedia:{" "}
          {context.placeholders.length > 0
            ? context.placeholders.map((placeholder) => (
                <button
                  key={placeholder.name}
                  type="button"
                  title={placeholder.description}
                  onClick={() => setMessage((current) => `${current} {{${placeholder.name}}}`)}
                  className="mr-1 rounded bg-neutral-200 px-1 py-0.5 font-mono text-[11px] hover:bg-neutral-300"
                >
                  {`{{${placeholder.name}}}`}
                </button>
              ))
            : "tidak ada (pesan dipakai apa adanya)"}
        </p>
        {context.placeholders.length > 0 ? (
          <ul className="list-inside list-disc">
            {context.placeholders.map((placeholder) => (
              <li key={placeholder.name}>
                <code>{`{{${placeholder.name}}}`}</code> — {placeholder.description}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="whitespace-pre-wrap text-neutral-700">Pratinjau: {preview}</p>
        <p className="truncate">
          Tautan:{" "}
          <a href={link} target="_blank" rel="noreferrer" className="text-neutral-800 underline">
            {link}
          </a>
        </p>
        {errors.map((error) => (
          <p key={error} className="text-red-700">
            {error}
          </p>
        ))}
        {warnings.map((warning) => (
          <p key={warning} className="text-amber-700">
            Perhatian: {warning}
          </p>
        ))}
      </div>

      <ErrorMessage error={state.error} />

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">
        <SaveButton label="Simpan template" />
        {message !== context.builtIn ? (
          <button
            type="button"
            onClick={() => setMessage(context.builtIn)}
            className="text-sm text-neutral-600 hover:underline"
          >
            Kembalikan teks bawaan
          </button>
        ) : null}
      </div>
    </form>
  );
}
