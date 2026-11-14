"use client";

import { useActionState, useState } from "react";

import {
  MAX_TEMPLATE_LENGTH,
  buildWhatsAppLink,
  fillTemplate,
  getContextDefinition,
  sampleValues,
  validateTemplate,
} from "@/lib/domain/whatsapp-template";

import { saveWhatsAppTemplateAction } from "../../actions/whatsapp-templates";
import { ErrorMessage, Field, SaveButton, inputClass } from "../_components/form-ui";
import { initialState, type WhatsAppContextRow } from "./whatsapp-template-parts";
import { TemplatePreview } from "./whatsapp-template-preview";

/** Form satu template konteks sistem, dengan pratinjau & placeholder. */
export function WhatsAppTemplateForm({
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

      <TemplatePreview
        context={context}
        preview={preview}
        link={link}
        number={number}
        errors={errors}
        warnings={warnings}
        onInsertPlaceholder={(name) => setMessage((current) => `${current} {{${name}}}`)}
      />

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