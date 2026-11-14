"use client";

import type { getContextDefinition } from "@/lib/domain/whatsapp-template";

type Context = ReturnType<typeof getContextDefinition>;

/** Kotak placeholder, pratinjau pesan, tautan wa.me, dan galat/perhatian. */
export function TemplatePreview({
  context,
  preview,
  link,
  number,
  errors,
  warnings,
  onInsertPlaceholder,
}: {
  context: Context;
  preview: string;
  link: string;
  number: string;
  errors: string[];
  warnings: string[];
  onInsertPlaceholder: (name: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
      <p>
        Placeholder tersedia:{" "}
        {context.placeholders.length > 0
          ? context.placeholders.map((placeholder) => (
              <button
                key={placeholder.name}
                type="button"
                title={placeholder.description}
                onClick={() => onInsertPlaceholder(placeholder.name)}
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
      {number ? (
        <p className="truncate">
          Tautan:{" "}
          <a href={link} target="_blank" rel="noreferrer" className="text-neutral-800 underline">
            {link}
          </a>
        </p>
      ) : (
        <p>Nomor WhatsApp belum diatur di Kontak &amp; Umum — pratinjau tautan disembunyikan.</p>
      )}
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
  );
}