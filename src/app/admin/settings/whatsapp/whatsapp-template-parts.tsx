"use client";

import type { WhatsAppContextKey } from "@/lib/domain/whatsapp-template";

import { deleteWhatsAppTemplateAction, type WhatsAppTemplateActionState } from "../../actions/whatsapp-templates";
import { ConfirmSubmit } from "../_components/form-ui";

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

export const initialState: WhatsAppTemplateActionState = { error: null };

/** Template non-sistem yang tidak dipakai website (bisa dihapus). */
export function OtherTemplates({ others }: { others: OtherTemplateRow[] }) {
  if (others.length === 0) return null;
  return (
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
  );
}