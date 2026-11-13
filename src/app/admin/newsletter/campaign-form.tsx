"use client";

import Link from "next/link";
import { useActionState } from "react";

import { RichTextField } from "../rich-text-field";
import { saveNewsletterCampaignAction, type ActionState } from "../actions/newsletter";
import { ConfirmDeleteButton, ErrorAlert, Field, SaveButton, inputClass } from "../promos/_kit/form-ui";
import { deleteNewsletterCampaignAction } from "../actions/newsletter";
import { SendCampaignButton } from "./send-campaign-button";

export type CampaignFormData = {
  id: string | null;
  subject: string;
  previewText: string;
  bodyHtml: string;
  status: "DRAFT" | "SENDING" | "SENT" | "FAILED";
  canSend: boolean;
};

const initialState: ActionState = { error: null };
const LIST_PATH = "/admin/newsletter";

export function CampaignForm({ campaign }: { campaign: CampaignFormData }) {
  const [state, formAction] = useActionState(saveNewsletterCampaignAction, initialState);
  const readOnly = campaign.status !== "DRAFT";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={LIST_PATH} className="text-sm text-neutral-600 hover:underline">
        ← Kembali ke daftar kampanye
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-neutral-900">
        {campaign.id ? "Ubah kampanye" : "Tulis kampanye"}
      </h1>
      {readOnly ? (
        <p className="mt-1 text-sm text-amber-700">
          Kampanye berstatus {campaign.status} tidak bisa diubah lagi.
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        {campaign.id ? <input type="hidden" name="id" value={campaign.id} /> : null}

        <ErrorAlert message={state.error} />

        <Field label="Subjek email" htmlFor="subject">
          <input
            id="subject"
            name="subject"
            defaultValue={campaign.subject}
            maxLength={150}
            required
            disabled={readOnly}
            className={inputClass}
          />
        </Field>

        <Field label="Teks preview" htmlFor="previewText" hint="Muncul di inbox sebelum subjek dibuka (opsional).">
          <input
            id="previewText"
            name="previewText"
            defaultValue={campaign.previewText}
            maxLength={150}
            disabled={readOnly}
            className={inputClass}
          />
        </Field>

        {readOnly ? (
          <div
            className="kama-prose rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
            dangerouslySetInnerHTML={{ __html: campaign.bodyHtml }}
          />
        ) : (
          <RichTextField
            name="bodyHtml"
            label="Isi kampanye"
            defaultValue={campaign.bodyHtml}
            folder="newsletter"
            hint="Tautan, gambar, dan table didukung. Header & footer global otomatis ditambahkan saat dikirim (atur di menu Pengaturan)."
          />
        )}

        {!readOnly ? (
          <div className="flex items-center gap-3">
            <SaveButton label="Simpan draft" />
            {campaign.id && campaign.canSend ? (
              <SendCampaignButton campaignId={campaign.id} />
            ) : null}
          </div>
        ) : null}
      </form>

      {campaign.id && campaign.status !== "SENDING" ? (
        <form action={deleteNewsletterCampaignAction} className="mt-6">
          <input type="hidden" name="id" value={campaign.id} />
          <ConfirmDeleteButton message="Hapus kampanye ini?">Hapus kampanye</ConfirmDeleteButton>
        </form>
      ) : null}
    </div>
  );
}
