"use client";

import { useActionState } from "react";

import { RichTextField } from "../../rich-text-field";
import { saveNewsletterSettingsAction, type ActionState } from "../../actions/newsletter";
import { ErrorAlert, Field, inputClass, SaveButton } from "../../promos/_kit/form-ui";

const initialState: ActionState = { error: null };

export type SettingsFormData = {
  headerHtml: string;
  footerHtml: string;
  senderName: string;
  replyTo: string;
  physicalAddress: string;
  unsubscribeNotice: string;
};

export function SettingsForm({ settings }: { settings: SettingsFormData }) {
  const [state, formAction] = useActionState(saveNewsletterSettingsAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <ErrorAlert message={state.error} />

      <RichTextField
        name="headerHtml"
        label="Header email"
        defaultValue={settings.headerHtml}
        folder="newsletter"
        compact
      />

      <RichTextField
        name="footerHtml"
        label="Footer email"
        defaultValue={settings.footerHtml}
        folder="newsletter"
        compact
      />

      <Field label="Nama pengirim" htmlFor="senderName" hint="Tampil sebagai nama pengirim di inbox penerima.">
        <input id="senderName" name="senderName" defaultValue={settings.senderName} maxLength={120} className={inputClass} />
      </Field>

      <Field label="Reply-to (opsional)" htmlFor="replyTo">
        <input id="replyTo" name="replyTo" type="email" defaultValue={settings.replyTo} maxLength={254} className={inputClass} />
      </Field>

      <Field label="Alamat fisik" htmlFor="physicalAddress" hint="Tampil di footer email.">
        <input
          id="physicalAddress"
          name="physicalAddress"
          defaultValue={settings.physicalAddress}
          maxLength={300}
          className={inputClass}
        />
      </Field>

      <Field label="Catatan unsubscribe" htmlFor="unsubscribeNotice" hint="Tampil di footer, di atas tautan berhenti berlangganan.">
        <input
          id="unsubscribeNotice"
          name="unsubscribeNotice"
          defaultValue={settings.unsubscribeNotice}
          maxLength={300}
          className={inputClass}
        />
      </Field>

      <SaveButton />
    </form>
  );
}
